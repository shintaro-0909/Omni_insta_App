export interface UserContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv';
  networkSpeed: 'slow' | 'medium' | 'fast' | 'offline';
  batteryLevel: number | null;
  isCharging: boolean | null;
  memoryUsage: number | null;
  cpuUsage: number | null;
  orientation: 'portrait' | 'landscape';
  colorScheme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
  } | null;
  activity: 'stationary' | 'walking' | 'running' | 'driving' | 'unknown';
  engagement: 'low' | 'medium' | 'high';
  mood: 'stressed' | 'relaxed' | 'focused' | 'excited' | 'neutral';
}

export class ContextAnalyzer {
  private context: UserContext;
  private listeners: Set<(context: UserContext) => void> = new Set();
  private updateInterval: number | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private engagementMetrics = {
    clicks: 0,
    scrolls: 0,
    hovers: 0,
    keystrokes: 0,
    idleTime: 0,
    activeTime: 0,
  };
  private lastActivityTime = Date.now();

  constructor() {
    this.context = this.getInitialContext();
    this.initialize();
  }

  private getInitialContext(): UserContext {
    return {
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      deviceType: this.getDeviceType(),
      networkSpeed: 'fast',
      batteryLevel: null,
      isCharging: null,
      memoryUsage: null,
      cpuUsage: null,
      orientation: this.getOrientation(),
      colorScheme: this.getColorScheme(),
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: null,
      activity: 'unknown',
      engagement: 'medium',
      mood: 'neutral',
    };
  }

  private initialize() {
    // Start periodic updates
    this.startContextUpdates();

    // Setup event listeners
    this.setupEventListeners();

    // Setup performance monitoring
    this.setupPerformanceMonitoring();

    // Setup engagement tracking
    this.setupEngagementTracking();

    // Request permissions for advanced features
    this.requestAdvancedFeatures();
  }

  private startContextUpdates() {
    this.updateInterval = window.setInterval(() => {
      this.updateContext();
    }, 60000); // Update every minute

    // Immediate update
    this.updateContext();
  }

  private setupEventListeners() {
    // Orientation change
    window.addEventListener('orientationchange', () => {
      this.context.orientation = this.getOrientation();
      this.notifyListeners();
    });

    // Color scheme change
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        this.context.colorScheme = e.matches ? 'dark' : 'light';
        this.notifyListeners();
      });

    // Network change
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.updateNetworkSpeed();
      });
    }

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.engagementMetrics.idleTime += Date.now() - this.lastActivityTime;
      } else {
        this.lastActivityTime = Date.now();
      }
    });

    // Online/offline
    window.addEventListener('online', () => {
      this.context.networkSpeed = 'fast';
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.context.networkSpeed = 'offline';
      this.notifyListeners();
    });
  }

  private setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (
              entry.entryType === 'measure' ||
              entry.entryType === 'navigation'
            ) {
              this.analyzePerformance(entry);
            }
          }
        });

        this.performanceObserver.observe({
          entryTypes: ['measure', 'navigation', 'resource'],
        });
      } catch (error) {
        console.error('Failed to setup performance monitoring:', error);
      }
    }

    // Memory monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          this.context.memoryUsage =
            memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
      }, 5000);
    }
  }

  private setupEngagementTracking() {
    // Click tracking
    document.addEventListener('click', () => {
      this.engagementMetrics.clicks++;
      this.updateActivity();
    });

    // Scroll tracking
    let scrollTimeout: number | null = null;
    document.addEventListener('scroll', () => {
      this.engagementMetrics.scrolls++;
      this.updateActivity();

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.analyzeScrollBehavior();
      }, 200);
    });

    // Hover tracking
    document.addEventListener('mousemove', () => {
      this.engagementMetrics.hovers++;
      this.updateActivity();
    });

    // Keystroke tracking
    document.addEventListener('keydown', () => {
      this.engagementMetrics.keystrokes++;
      this.updateActivity();
    });

    // Analyze engagement every 30 seconds
    setInterval(() => {
      this.analyzeEngagement();
    }, 30000);
  }

  private async requestAdvancedFeatures() {
    // Battery status
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.context.batteryLevel = battery.level * 100;
        this.context.isCharging = battery.charging;

        battery.addEventListener('levelchange', () => {
          this.context.batteryLevel = battery.level * 100;
          this.notifyListeners();
        });

        battery.addEventListener('chargingchange', () => {
          this.context.isCharging = battery.charging;
          this.notifyListeners();
        });
      } catch (error) {
        console.error('Battery API not available:', error);
      }
    }

    // Geolocation (only if needed)
    // We'll skip this for privacy unless explicitly requested
  }

  private updateContext() {
    this.context.timeOfDay = this.getTimeOfDay();
    this.context.dayOfWeek = this.getDayOfWeek();
    this.updateNetworkSpeed();
    this.analyzeMood();
    this.notifyListeners();
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private getDayOfWeek(): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[new Date().getDay()] || 'Sunday';
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'tv' {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('tv') || width > 1920) return 'tv';
    if (userAgent.includes('mobile') || width < 768) return 'mobile';
    if (userAgent.includes('tablet') || width < 1024) return 'tablet';
    return 'desktop';
  }

  private getOrientation(): 'portrait' | 'landscape' {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  private getColorScheme(): 'light' | 'dark' | 'auto' {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches)
      return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches)
      return 'light';
    return 'auto';
  }

  private updateNetworkSpeed() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;

      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          this.context.networkSpeed = 'slow';
          break;
        case '3g':
          this.context.networkSpeed = 'medium';
          break;
        case '4g':
        default:
          this.context.networkSpeed = 'fast';
          break;
      }
    }
  }

  private updateActivity() {
    const now = Date.now();
    this.engagementMetrics.activeTime += now - this.lastActivityTime;
    this.lastActivityTime = now;
  }

  private analyzePerformance(entry: PerformanceEntry) {
    // Analyze performance metrics to determine system load
    if (entry.duration > 1000) {
      // High load detected
      this.context.cpuUsage = Math.min((this.context.cpuUsage || 0) + 0.1, 1);
    }
  }

  private analyzeScrollBehavior() {
    const scrollSpeed =
      (this.engagementMetrics.scrolls / (Date.now() - this.lastActivityTime)) *
      1000;

    if (scrollSpeed > 10) {
      // Fast scrolling - user might be searching
      this.context.activity = 'running';
    } else if (scrollSpeed > 2) {
      // Normal scrolling
      this.context.activity = 'walking';
    } else {
      // Slow or no scrolling
      this.context.activity = 'stationary';
    }
  }

  private analyzeEngagement() {
    const totalInteractions =
      this.engagementMetrics.clicks +
      this.engagementMetrics.scrolls +
      this.engagementMetrics.hovers +
      this.engagementMetrics.keystrokes;

    const interactionRate = totalInteractions / 30; // Per 30 seconds

    if (interactionRate < 5) {
      this.context.engagement = 'low';
    } else if (interactionRate < 20) {
      this.context.engagement = 'medium';
    } else {
      this.context.engagement = 'high';
    }

    // Reset metrics
    this.engagementMetrics = {
      clicks: 0,
      scrolls: 0,
      hovers: 0,
      keystrokes: 0,
      idleTime: this.engagementMetrics.idleTime,
      activeTime: this.engagementMetrics.activeTime,
    };
  }

  private analyzeMood() {
    // Analyze various factors to determine mood (simplified for build stability)
    // const factors = {
    //   timeOfDay: this.context.timeOfDay,
    //   engagement: this.context.engagement,
    //   activity: this.context.activity,
    //   networkSpeed: this.context.networkSpeed,
    //   batteryLevel: this.context.batteryLevel
    // }

    // Simple mood analysis based on factors
    if (
      this.context.networkSpeed === 'slow' ||
      (this.context.batteryLevel && this.context.batteryLevel < 20)
    ) {
      this.context.mood = 'stressed';
    } else if (
      this.context.engagement === 'high' &&
      this.context.activity === 'running'
    ) {
      this.context.mood = 'excited';
    } else if (
      this.context.engagement === 'medium' &&
      this.context.activity === 'stationary'
    ) {
      this.context.mood = 'focused';
    } else if (
      this.context.timeOfDay === 'evening' ||
      this.context.timeOfDay === 'night'
    ) {
      this.context.mood = 'relaxed';
    } else {
      this.context.mood = 'neutral';
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener({ ...this.context });
    });
  }

  // Public API
  public getContext(): UserContext {
    return { ...this.context };
  }

  public subscribe(listener: (context: UserContext) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async requestLocation(): Promise<void> {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        this.context.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        this.notifyListeners();
      } catch (error) {
        console.error('Geolocation request failed:', error);
      }
    }
  }

  public destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.listeners.clear();
  }
}

// Singleton instance
let analyzerInstance: ContextAnalyzer | null = null;

export function getContextAnalyzer(): ContextAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new ContextAnalyzer();
  }
  return analyzerInstance;
}

export function destroyContextAnalyzer() {
  if (analyzerInstance) {
    analyzerInstance.destroy();
    analyzerInstance = null;
  }
}
