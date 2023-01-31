export interface Handler {
    publish: (payload) => Promise<void>

    fetchAnalytics: (params: {
        [idx:string]: any
    }) => Promise<void>
}