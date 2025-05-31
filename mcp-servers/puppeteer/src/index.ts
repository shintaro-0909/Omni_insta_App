#!/usr/bin/env node

import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface ScreenshotOptions {
  url: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  selector?: string;
}

interface ContentOptions {
  url: string;
  selector?: string;
}

interface ClickOptions {
  url: string;
  selector: string;
}

interface FillFormOptions {
  url: string;
  fields: Record<string, string>;
}

class PuppeteerMCPServer {
  private browser: Browser | null = null;

  constructor() {
    this.setupCleanup();
  }

  private setupCleanup() {
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('exit', () => this.cleanup());
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=site-per-process'
        ]
      });
    }
    return this.browser;
  }

  private async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async takeScreenshot(options: ScreenshotOptions): Promise<string> {
    const { url, width = 1920, height = 1080, fullPage = false, selector } = options;
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setViewport({ width, height });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      let screenshotBuffer: Buffer;
      
      if (selector) {
        const element = await page.$(selector);
        if (!element) {
          throw new Error(`Element with selector "${selector}" not found`);
        }
        screenshotBuffer = await element.screenshot();
      } else {
        screenshotBuffer = await page.screenshot({ fullPage });
      }
      
      // Save to temp file
      const tempDir = os.tmpdir();
      const filename = `screenshot-${Date.now()}.png`;
      const filepath = path.join(tempDir, filename);
      
      await fs.writeFile(filepath, screenshotBuffer);
      
      return filepath;
    } finally {
      await page.close();
    }
  }

  async getPageContent(options: ContentOptions): Promise<string> {
    const { url, selector } = options;
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      let content: string;
      
      if (selector) {
        content = await page.$eval(selector, el => el.textContent || '');
      } else {
        content = await page.evaluate(() => document.body.textContent || '');
      }
      
      return content;
    } finally {
      await page.close();
    }
  }

  async clickElement(options: ClickOptions): Promise<string> {
    const { url, selector } = options;
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.click(selector);
      
      // Wait for potential navigation or changes
      await page.waitForTimeout(1000);
      
      return `Clicked element: ${selector}`;
    } finally {
      await page.close();
    }
  }

  async fillForm(options: FillFormOptions): Promise<string> {
    const { url, fields } = options;
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      for (const [selector, value] of Object.entries(fields)) {
        await page.type(selector, value);
      }
      
      return `Filled form fields: ${Object.keys(fields).join(', ')}`;
    } finally {
      await page.close();
    }
  }

  // Simple stdio interface for MCP
  async handleStdioInput() {
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (data) => {
      try {
        const request = JSON.parse(data.toString().trim());
        let result: any;

        switch (request.method) {
          case 'screenshot':
            const filepath = await this.takeScreenshot(request.params);
            result = { success: true, filepath };
            break;
          case 'getContent':
            const content = await this.getPageContent(request.params);
            result = { success: true, content };
            break;
          case 'click':
            const clickResult = await this.clickElement(request.params);
            result = { success: true, message: clickResult };
            break;
          case 'fillForm':
            const fillResult = await this.fillForm(request.params);
            result = { success: true, message: fillResult };
            break;
          default:
            result = { success: false, error: 'Unknown method' };
        }

        process.stdout.write(JSON.stringify(result) + '\n');
      } catch (error) {
        const errorResult = { 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        };
        process.stdout.write(JSON.stringify(errorResult) + '\n');
      }
    });
  }

  async start() {
    console.error('Puppeteer MCP Server starting...');
    await this.handleStdioInput();
  }
}

// Start the server
const server = new PuppeteerMCPServer();
server.start().catch(console.error);