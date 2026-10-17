import { defineStore } from 'pinia'

const STORAGE_KEY = 'xn-game-v1'
export const MAX_HP = 100
export const NEW_PROJECT_HEAL = 20
export const BOSS_HITS = 3

export const useGameStore = defineStore('game', {
    state: () => ({
        hp: MAX_HP,
        visited: [], // project slugs
        totalProjects: 0,
        bossHits: 0,
        flags: { list: false, end: false }, // one-shot quests
        rewardUnlocked: false,
        rewardOpen: false,
        ko: false,
        hitTick: 0, // bumps on damage, drives the shake
        floaters: [],
        hydrated: false,
    }),

    getters: {
        quests: state => [
            {
                id: 'explore',
                label: 'Discover every project',
                progress: Math.min(state.visited.length, state.totalProjects || 1),
                goal: state.totalProjects || 1,
            },
            {
                id: 'boss',
                label: 'Hit the name 3 times',
                progress: Math.min(state.bossHits, BOSS_HITS),
                goal: BOSS_HITS,
            },
            {
                id: 'list',
                label: 'Switch the archive to List',
                progress: state.flags.list ? 1 : 0,
                goal: 1,
            },
            {
                id: 'end',
                label: 'Reach the contact section',
                progress: state.flags.end ? 1 : 0,
                goal: 1,
            },
        ],
        doneCount() {
            return this.quests.filter(q => q.progress >= q.goal).length
        },
        allDone() {
            return this.totalProjects > 0 && this.doneCount === this.quests.length
        },
    },

    actions: {
        hydrate() {
            if (this.hydrated) return
            try {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
                if (saved) {
                    this.hp = Math.min(MAX_HP, Math.max(1, saved.hp ?? MAX_HP))
                    this.visited = saved.visited || []
                    this.bossHits = saved.bossHits || 0
                    this.flags = { ...this.flags, ...(saved.flags || {}) }
                    this.rewardUnlocked = !!saved.rewardUnlocked
                }
            } catch {}
            this.hydrated = true
        },
        persist() {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        hp: this.hp,
                        visited: this.visited,
                        bossHits: this.bossHits,
                        flags: this.flags,
                        rewardUnlocked: this.rewardUnlocked,
                    }),
                )
            } catch {}
        },
        setTotal(n) {
            this.totalProjects = n
            this.checkReward()
        },
        float(text, kind, x, y) {
            const id = `${Date.now()}-${Math.random()}`
            this.floaters.push({ id, text, kind, x, y })
            setTimeout(() => {
                this.floaters = this.floaters.filter(f => f.id !== id)
            }, 1000)
        },
        damage(amount, x, y) {
            if (this.ko) return
            this.hp = Math.max(0, this.hp - amount)
            this.hitTick++
            this.float(`-${amount}`, 'damage', x, y)
            if (this.hp === 0) {
                this.ko = true
                // respawn at half health, progress is kept
                setTimeout(() => {
                    this.hp = 50
                    this.ko = false
                    this.persist()
                }, 2600)
            }
            this.persist()
        },
        heal(amount, x, y) {
            const before = this.hp
            this.hp = Math.min(MAX_HP, this.hp + amount)
            if (this.hp > before) this.float(`+${this.hp - before}`, 'heal', x, y)
            this.persist()
        },
        hitBoss() {
            this.bossHits++
            this.persist()
            this.checkReward()
        },
        visitProject(slug) {
            if (!slug || this.visited.includes(slug)) return
            this.visited.push(slug)
            this.heal(NEW_PROJECT_HEAL, window.innerWidth - 120, 110)
            this.persist()
            this.checkReward()
        },
        complete(flag) {
            if (this.flags[flag]) return
            this.flags[flag] = true
            this.persist()
            this.checkReward()
        },
        checkReward() {
            if (this.allDone && !this.rewardUnlocked) {
                this.rewardUnlocked = true
                this.rewardOpen = true
                this.persist()
            }
        },
        reset() {
            this.hp = MAX_HP
            this.visited = []
            this.bossHits = 0
            this.flags = { list: false, end: false }
            this.rewardUnlocked = false
            this.rewardOpen = false
            this.ko = false
            this.persist()
        },
    },
})
