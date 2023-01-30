export interface Handler {
    publish: (payload) => Promise<void>

    fetchAnalytics: (params) => Promise<void>
}