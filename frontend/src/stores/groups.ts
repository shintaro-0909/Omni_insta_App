import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'

// グループタイプ定義
export interface Group {
  id: string
  name: string
  description?: string
  igAccountIds: string[]
  proxyId?: string
  color?: string
  isActive: boolean
  createdAt: any
  updatedAt: any
}

export interface GroupStats {
  total: number
  active: number
  inactive: number
  withProxy: number
  totalAccounts: number
}

export const useGroupsStore = defineStore('groups', () => {
  // State
  const groups = ref<Group[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeGroups = computed(() => 
    groups.value.filter(group => group.isActive)
  )

  const inactiveGroups = computed(() => 
    groups.value.filter(group => !group.isActive)
  )

  const groupsWithProxy = computed(() => 
    groups.value.filter(group => group.proxyId)
  )

  const groupStats = computed((): GroupStats => ({
    total: groups.value.length,
    active: activeGroups.value.length,
    inactive: inactiveGroups.value.length,
    withProxy: groupsWithProxy.value.length,
    totalAccounts: groups.value.reduce((total, group) => total + group.igAccountIds.length, 0)
  }))

  const getGroupById = computed(() => (id: string) => 
    groups.value.find(group => group.id === id)
  )

  const getGroupsByProxyId = computed(() => (proxyId: string) => 
    groups.value.filter(group => group.proxyId === proxyId)
  )

  // Actions

  // グループ一覧取得
  const fetchGroups = async () => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const getGroupsFunc = httpsCallable(functions, 'getGroups')
      const result = await getGroupsFunc()
      
      if (result.data && (result.data as any).success) {
        const data = result.data as any
        groups.value = data.groups.map((group: any) => ({
          ...group,
          createdAt: group.createdAt.toDate ? group.createdAt.toDate() : new Date(group.createdAt),
          updatedAt: group.updatedAt.toDate ? group.updatedAt.toDate() : new Date(group.updatedAt)
        }))
        console.log('✅ グループ一覧取得成功:', groups.value.length)
      } else {
        throw new Error('Failed to fetch groups')
      }
    } catch (err: any) {
      error.value = err.message || 'グループ一覧の取得に失敗しました'
      console.error('❌ グループ一覧取得エラー:', err)
    } finally {
      loading.value = false
    }
  }

  // グループ作成
  const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const createGroupFunc = httpsCallable(functions, 'createGroup')
      const result = await createGroupFunc(groupData)
      
      if (result.data && (result.data as any).success) {
        const data = result.data as any
        const newGroup: Group = {
          ...data.group,
          createdAt: data.group.createdAt.toDate ? data.group.createdAt.toDate() : new Date(data.group.createdAt),
          updatedAt: data.group.updatedAt.toDate ? data.group.updatedAt.toDate() : new Date(data.group.updatedAt)
        }
        
        groups.value.unshift(newGroup)
        console.log('✅ グループ作成成功:', newGroup.name)
        
        return newGroup
      } else {
        throw new Error('Failed to create group')
      }
    } catch (err: any) {
      error.value = err.message || 'グループの作成に失敗しました'
      console.error('❌ グループ作成エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // グループ更新
  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const updateGroupFunc = httpsCallable(functions, 'updateGroup')
      const result = await updateGroupFunc({ groupId, ...updates })
      
      if (result.data && (result.data as any).success) {
        const data = result.data as any
        const updatedGroup: Group = {
          ...data.group,
          createdAt: data.group.createdAt.toDate ? data.group.createdAt.toDate() : new Date(data.group.createdAt),
          updatedAt: data.group.updatedAt.toDate ? data.group.updatedAt.toDate() : new Date(data.group.updatedAt)
        }
        
        const index = groups.value.findIndex(group => group.id === groupId)
        if (index !== -1) {
          groups.value[index] = updatedGroup
          console.log('✅ グループ更新成功:', updatedGroup.name)
        }
        
        return updatedGroup
      } else {
        throw new Error('Failed to update group')
      }
    } catch (err: any) {
      error.value = err.message || 'グループの更新に失敗しました'
      console.error('❌ グループ更新エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // グループ削除
  const deleteGroup = async (groupId: string) => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const deleteGroupFunc = httpsCallable(functions, 'deleteGroup')
      const result = await deleteGroupFunc({ groupId })
      
      if (result.data && (result.data as any).success) {
        const index = groups.value.findIndex(group => group.id === groupId)
        if (index !== -1) {
          const deletedGroup = groups.value.splice(index, 1)[0]
          console.log('✅ グループ削除成功:', deletedGroup.name)
        }
      } else {
        throw new Error('Failed to delete group')
      }
    } catch (err: any) {
      error.value = err.message || 'グループの削除に失敗しました'
      console.error('❌ グループ削除エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // グループにプロキシを割り当て
  const assignProxyToGroup = async (groupId: string, proxyId: string) => {
    try {
      const functions = getFunctions()
      const assignProxyFunc = httpsCallable(functions, 'assignProxyToGroup')
      const result = await assignProxyFunc({ groupId, proxyId })
      
      if (result.data && (result.data as any).success) {
        await updateGroup(groupId, { proxyId })
        console.log('✅ グループにプロキシ割り当て成功')
      } else {
        throw new Error('Failed to assign proxy to group')
      }
    } catch (err: any) {
      error.value = err.message || 'プロキシの割り当てに失敗しました'
      console.error('❌ プロキシ割り当てエラー:', err)
      throw err
    }
  }

  // グループからプロキシを削除
  const removeProxyFromGroup = async (groupId: string) => {
    try {
      const functions = getFunctions()
      const removeProxyFunc = httpsCallable(functions, 'removeProxyFromGroup')
      const result = await removeProxyFunc({ groupId })
      
      if (result.data && (result.data as any).success) {
        await updateGroup(groupId, { proxyId: undefined })
        console.log('✅ グループからプロキシ削除成功')
      } else {
        throw new Error('Failed to remove proxy from group')
      }
    } catch (err: any) {
      error.value = err.message || 'プロキシの削除に失敗しました'
      console.error('❌ プロキシ削除エラー:', err)
      throw err
    }
  }

  // エラークリア
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    groups,
    loading,
    error,
    // Getters
    activeGroups,
    inactiveGroups,
    groupsWithProxy,
    groupStats,
    getGroupById,
    getGroupsByProxyId,
    // Actions
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    assignProxyToGroup,
    removeProxyFromGroup,
    clearError
  }
})