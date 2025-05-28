import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PostFormDialog from '../PostFormDialog.vue'
import { usePostsStore } from '@/stores/posts'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

describe('PostFormDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders post form dialog correctly', () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-testid="post-form-dialog"]').exists()).toBe(true)
  })

  it('validates required fields', async () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    // Try to submit empty form
    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // Should show validation errors
    expect(wrapper.text()).toContain('required')
  })

  it('emits close event when cancel is clicked', async () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const cancelButton = wrapper.find('[data-testid="cancel-button"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('handles file upload correctly', async () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const fileInput = wrapper.find('input[type="file"]')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })

    await fileInput.trigger('change')

    const component = wrapper.vm as any
    expect(component.form.images).toHaveLength(1)
  })

  it('validates image file types', () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const component = wrapper.vm as any
    
    // Valid image types
    expect(component.isValidImageType('image/jpeg')).toBe(true)
    expect(component.isValidImageType('image/png')).toBe(true)
    expect(component.isValidImageType('image/gif')).toBe(true)
    
    // Invalid types
    expect(component.isValidImageType('text/plain')).toBe(false)
    expect(component.isValidImageType('video/mp4')).toBe(false)
  })

  it('limits maximum number of images', async () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const component = wrapper.vm as any
    
    // Add maximum allowed images (10)
    for (let i = 0; i < 11; i++) {
      component.form.images.push({
        file: new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' }),
        preview: `data:image/jpeg;base64,test${i}`
      })
    }

    expect(component.form.images).toHaveLength(10)
  })

  it('creates post with valid data', async () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const store = usePostsStore()
    const createPostSpy = vi.spyOn(store, 'createPost').mockResolvedValue({
      id: 'test-post-id',
      caption: 'Test caption',
      images: [],
      tags: [],
      createdAt: new Date(),
      userId: 'test-user'
    })

    const component = wrapper.vm as any
    component.form.caption = 'Test caption'
    component.form.tags = ['test', 'post']
    component.form.images = [{
      file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      preview: 'data:image/jpeg;base64,test'
    }]

    await component.submitForm()

    expect(createPostSpy).toHaveBeenCalledWith({
      caption: 'Test caption',
      tags: ['test', 'post'],
      images: expect.any(Array)
    })
  })
})