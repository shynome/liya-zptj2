import { writable } from 'svelte/store'

export type Item = { A: string; B: string; C: string }

export type Table = { [user: string]: { [gift: string]: number } }

export const head = writable<Item | null>(null)

export const table = writable<Table>({})
