/// <reference types="cypress" />

describe('Content Management', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  }

  beforeEach(() => {
    cy.cleanupTestData()
    cy.seedTestData()
    cy.mockFirebaseAuth(mockUser)
    cy.visit('/content')
    cy.get('[data-testid="content-view"]', { timeout: 10000 }).should('be.visible')
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should display content library page', () => {
    cy.get('[data-testid="content-title"]').should('contain', 'Content Library')
    cy.get('[data-testid="create-post-btn"]').should('be.visible')
    cy.get('[data-testid="content-grid"]').should('be.visible')
    cy.get('[data-testid="content-filters"]').should('be.visible')
  })

  it('should create a new post with single image', () => {
    cy.mockPostCreation()
    
    cy.get('[data-testid="create-post-btn"]').click()
    cy.get('[data-testid="post-form-dialog"]').should('be.visible')
    
    // Fill post form
    cy.get('[data-testid="post-title"]').type('Test Single Image Post')
    cy.get('[data-testid="post-caption"]').type('This is a test post with a single image. #test #cypress')
    
    // Upload single image
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
    cy.get('[data-testid="uploaded-image"]').should('be.visible')
    
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('createPost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify post appears in content grid
    cy.get('[data-testid="content-item"]').should('contain', 'Test Single Image Post')
    cy.get('[data-testid="post-media-count"]').should('contain', '1 image')
  })

  it('should create a carousel post with multiple images', () => {
    cy.mockPostCreation()
    
    cy.get('[data-testid="create-post-btn"]').click()
    
    cy.get('[data-testid="post-title"]').type('Test Carousel Post')
    cy.get('[data-testid="post-caption"]').type('Carousel post with multiple images #carousel #test')
    
    // Upload multiple images
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-2.jpg')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-3.jpg')
    
    cy.get('[data-testid="uploaded-image"]').should('have.length', 3)
    cy.get('[data-testid="carousel-preview"]').should('be.visible')
    
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('createPost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify carousel post
    cy.get('[data-testid="content-item"]').should('contain', 'Test Carousel Post')
    cy.get('[data-testid="post-media-count"]').should('contain', '3 images')
  })

  it('should edit an existing post', () => {
    // Create a post first
    cy.mockPostCreation()
    cy.get('[data-testid="create-post-btn"]').click()
    cy.get('[data-testid="post-title"]').type('Original Post Title')
    cy.get('[data-testid="post-caption"]').type('Original caption')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('createPost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Mock update API
    cy.intercept('PUT', '**/api/posts/*', {
      statusCode: 200,
      body: {
        id: 'test-post-id',
        title: 'Updated Post Title',
        caption: 'Updated caption with new content',
        mediaUrls: ['https://example.com/updated-image.jpg'],
        updatedAt: new Date().toISOString()
      }
    }).as('updatePost')
    
    // Edit the post
    cy.get('[data-testid="content-item"]').first().find('[data-testid="edit-btn"]').click()
    cy.get('[data-testid="post-form-dialog"]').should('be.visible')
    
    // Update fields
    cy.get('[data-testid="post-title"]').clear().type('Updated Post Title')
    cy.get('[data-testid="post-caption"]').clear().type('Updated caption with new content')
    
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('updatePost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify changes
    cy.get('[data-testid="content-item"]').should('contain', 'Updated Post Title')
  })

  it('should delete a post', () => {
    // Create a post first
    cy.mockPostCreation()
    cy.get('[data-testid="create-post-btn"]').click()
    cy.get('[data-testid="post-title"]').type('Post to Delete')
    cy.get('[data-testid="post-caption"]').type('This post will be deleted')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('createPost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Mock delete API
    cy.intercept('DELETE', '**/api/posts/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deletePost')
    
    // Count posts before deletion
    cy.get('[data-testid="content-item"]').its('length').then((initialCount) => {
      // Delete the post
      cy.get('[data-testid="content-item"]').first().find('[data-testid="delete-btn"]').click()
      cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible')
      cy.get('[data-testid="confirm-delete-btn"]').click()
      
      cy.waitForApiCall('deletePost')
      cy.get('[data-testid="success-message"]').should('be.visible')
      
      // Verify post count decreased
      cy.get('[data-testid="content-item"]').should('have.length', initialCount - 1)
      cy.get('[data-testid="content-grid"]').should('not.contain', 'Post to Delete')
    })
  })

  it('should preview post content', () => {
    // Create a post first
    cy.mockPostCreation()
    cy.get('[data-testid="create-post-btn"]').click()
    cy.get('[data-testid="post-title"]').type('Post for Preview')
    cy.get('[data-testid="post-caption"]').type('This post will be previewed #preview #test')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('createPost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Preview the post
    cy.get('[data-testid="content-item"]').first().find('[data-testid="preview-btn"]').click()
    cy.get('[data-testid="post-preview-dialog"]').should('be.visible')
    
    // Verify preview content
    cy.get('[data-testid="preview-title"]').should('contain', 'Post for Preview')
    cy.get('[data-testid="preview-caption"]').should('contain', 'This post will be previewed #preview #test')
    cy.get('[data-testid="preview-image"]').should('be.visible')
    cy.get('[data-testid="preview-hashtags"]').should('contain', '#preview')
    cy.get('[data-testid="preview-hashtags"]').should('contain', '#test')
    
    // Close preview
    cy.get('[data-testid="close-preview-btn"]').click()
    cy.get('[data-testid="post-preview-dialog"]').should('not.exist')
  })

  it('should filter posts by media type', () => {
    // Create different types of posts
    cy.mockPostCreation()
    
    // Single image post
    cy.get('[data-testid="create-post-btn"]').click()
    cy.get('[data-testid="post-title"]').type('Single Image Post')
    cy.get('[data-testid="post-caption"]').type('Single image content')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('createPost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Carousel post
    cy.get('[data-testid="create-post-btn"]').click()
    cy.get('[data-testid="post-title"]').type('Carousel Post')
    cy.get('[data-testid="post-caption"]').type('Carousel content')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
    cy.uploadFile('[data-testid="image-upload"]', 'test-image-2.jpg')
    cy.get('[data-testid="save-post-btn"]').click()
    cy.waitForApiCall('createPost')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Test filtering
    cy.get('[data-testid="filter-media-type"]').select('single')
    cy.get('[data-testid="content-item"]').should('have.length', 1)
    cy.get('[data-testid="content-item"]').should('contain', 'Single Image Post')
    
    cy.get('[data-testid="filter-media-type"]').select('carousel')
    cy.get('[data-testid="content-item"]').should('have.length', 1)
    cy.get('[data-testid="content-item"]').should('contain', 'Carousel Post')
    
    cy.get('[data-testid="filter-media-type"]').select('all')
    cy.get('[data-testid="content-item"]').should('have.length', 2)
  })

  it('should search posts by title and caption', () => {
    // Create posts with different content
    const posts = [
      { title: 'Marketing Strategy', caption: 'Content about marketing tactics #marketing' },
      { title: 'Product Launch', caption: 'Announcing new product release #product #launch' },
      { title: 'Daily Update', caption: 'Regular daily content #daily #update' }
    ]
    
    cy.mockPostCreation()
    
    posts.forEach((post) => {
      cy.get('[data-testid="create-post-btn"]').click()
      cy.get('[data-testid="post-title"]').type(post.title)
      cy.get('[data-testid="post-caption"]').type(post.caption)
      cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
      cy.get('[data-testid="save-post-btn"]').click()
      cy.waitForApiCall('createPost')
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
    
    // Test search functionality
    cy.get('[data-testid="search-input"]').type('Marketing')
    cy.get('[data-testid="content-item"]').should('have.length', 1)
    cy.get('[data-testid="content-item"]').should('contain', 'Marketing Strategy')
    
    cy.get('[data-testid="search-input"]').clear().type('product')
    cy.get('[data-testid="content-item"]').should('have.length', 1)
    cy.get('[data-testid="content-item"]').should('contain', 'Product Launch')
    
    cy.get('[data-testid="search-input"]').clear().type('daily')
    cy.get('[data-testid="content-item"]').should('have.length', 1)
    cy.get('[data-testid="content-item"]').should('contain', 'Daily Update')
    
    cy.get('[data-testid="search-input"]').clear().type('nonexistent')
    cy.get('[data-testid="no-results"]').should('be.visible')
    cy.get('[data-testid="content-item"]').should('not.exist')
    
    // Clear search
    cy.get('[data-testid="search-input"]').clear()
    cy.get('[data-testid="content-item"]').should('have.length', 3)
  })

  it('should handle validation errors', () => {
    cy.get('[data-testid="create-post-btn"]').click()
    
    // Try to save without required fields
    cy.get('[data-testid="save-post-btn"]').click()
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Title is required')
    
    // Fill title but leave caption empty
    cy.get('[data-testid="post-title"]').type('Test Post')
    cy.get('[data-testid="save-post-btn"]').click()
    cy.get('[data-testid="error-message"]').should('contain', 'Caption is required')
    
    // Fill caption but don't upload media
    cy.get('[data-testid="post-caption"]').type('Test caption')
    cy.get('[data-testid="save-post-btn"]').click()
    cy.get('[data-testid="error-message"]').should('contain', 'At least one image is required')
  })

  it('should handle file upload errors', () => {
    cy.get('[data-testid="create-post-btn"]').click()
    
    // Mock file upload error
    cy.intercept('POST', '**/api/upload', {
      statusCode: 400,
      body: { error: 'File too large' }
    }).as('uploadError')
    
    cy.get('[data-testid="post-title"]').type('Test Post')
    cy.get('[data-testid="post-caption"]').type('Test caption')
    
    // Try to upload a file (will fail due to mock)
    cy.uploadFile('[data-testid="image-upload"]', 'large-image.jpg')
    
    cy.get('[data-testid="upload-error"]').should('be.visible')
    cy.get('[data-testid="upload-error"]').should('contain', 'File too large')
  })

  it('should sort posts by different criteria', () => {
    // Create posts with different timestamps
    const posts = [
      { title: 'Oldest Post', caption: 'This is the oldest post' },
      { title: 'Newest Post', caption: 'This is the newest post' },
      { title: 'Middle Post', caption: 'This is the middle post' }
    ]
    
    cy.mockPostCreation()
    
    posts.forEach((post, index) => {
      // Mock different creation times
      cy.intercept('POST', '**/api/posts', {
        statusCode: 200,
        body: {
          id: `post-${index}`,
          title: post.title,
          caption: post.caption,
          mediaUrls: ['https://example.com/test-image.jpg'],
          createdAt: new Date(Date.now() - (posts.length - index) * 1000).toISOString()
        }
      }).as(`createPost${index}`)
      
      cy.get('[data-testid="create-post-btn"]').click()
      cy.get('[data-testid="post-title"]').type(post.title)
      cy.get('[data-testid="post-caption"]').type(post.caption)
      cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
      cy.get('[data-testid="save-post-btn"]').click()
      cy.waitForApiCall(`createPost${index}`)
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
    
    // Test sorting by newest first (default)
    cy.get('[data-testid="sort-select"]').should('have.value', 'newest')
    cy.get('[data-testid="content-item"]').first().should('contain', 'Newest Post')
    
    // Sort by oldest first
    cy.get('[data-testid="sort-select"]').select('oldest')
    cy.get('[data-testid="content-item"]').first().should('contain', 'Oldest Post')
    
    // Sort by title A-Z
    cy.get('[data-testid="sort-select"]').select('title-asc')
    cy.get('[data-testid="content-item"]').first().should('contain', 'Middle Post')
    
    // Sort by title Z-A
    cy.get('[data-testid="sort-select"]').select('title-desc')
    cy.get('[data-testid="content-item"]').first().should('contain', 'Oldest Post')
  })

  it('should handle bulk operations', () => {
    // Create multiple posts
    cy.mockPostCreation()
    
    const posts = ['Post 1', 'Post 2', 'Post 3']
    posts.forEach((title) => {
      cy.get('[data-testid="create-post-btn"]').click()
      cy.get('[data-testid="post-title"]').type(title)
      cy.get('[data-testid="post-caption"]').type(`Caption for ${title}`)
      cy.uploadFile('[data-testid="image-upload"]', 'test-image-1.jpg')
      cy.get('[data-testid="save-post-btn"]').click()
      cy.waitForApiCall('createPost')
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
    
    // Select multiple posts
    cy.get('[data-testid="select-all-checkbox"]').check()
    cy.get('[data-testid="content-item"] [data-testid="item-checkbox"]').should('be.checked')
    cy.get('[data-testid="bulk-actions"]').should('be.visible')
    
    // Mock bulk delete
    cy.intercept('DELETE', '**/api/posts/bulk', {
      statusCode: 200,
      body: { deleted: 3 }
    }).as('bulkDelete')
    
    // Bulk delete
    cy.get('[data-testid="bulk-delete-btn"]').click()
    cy.get('[data-testid="confirm-bulk-delete-dialog"]').should('be.visible')
    cy.get('[data-testid="confirm-bulk-delete-btn"]').click()
    
    cy.waitForApiCall('bulkDelete')
    cy.get('[data-testid="success-message"]').should('contain', 'Posts deleted successfully')
  })
})