export interface Handler {
    validate: () => boolean

    handle: () => Promise<void>
}