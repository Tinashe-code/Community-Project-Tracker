import { defineStore } from 'pinia'
import * as api from '@/api/db.js'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,      // { id, name, role: 'site_admin'|'community_admin', communityId?, community? }
    member: null,
    memberCommunity: null,
    loading: false,
    error: null
  }),
  getters: {
    isSiteAdmin: s => s.user?.role === 'site_admin',
    isCommunityAdmin: s => s.user?.role === 'community_admin',
    isAnyAdmin: s => !!s.user,
    isMember: s => !!s.member,
  },
  actions: {
    async loginSiteAdmin(username, password) {
      this.loading = true; this.error = null
      try { this.user = await api.siteAdminLogin(username, password); return true }
      catch (e) { this.error = e.message; return false }
      finally { this.loading = false }
    },
    async loginCommunityAdmin(username, password) {
      this.loading = true; this.error = null
      try { this.user = await api.communityAdminLogin(username, password); return true }
      catch (e) { this.error = e.message; return false }
      finally { this.loading = false }
    },
    async loginMember(communityId, houseNumber, phone) {
      this.loading = true; this.error = null
      try {
        const { member, community } = await api.memberLogin(communityId, houseNumber, phone)
        this.member = member; this.memberCommunity = community; return true
      }
      catch (e) { this.error = e.message; return false }
      finally { this.loading = false }
    },
    logout() { this.user = null; this.member = null; this.memberCommunity = null },
    clearError() { this.error = null }
  }
})
