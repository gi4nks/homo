import { PrismaClient } from '@prisma/client'
import { calculateWordCount } from './html-sanitizer'

const prismaClientSingleton = () => {
  const baseClient = new PrismaClient()

  // Prisma Client Extension: Auto-calculate word count for Scene content changes
  const client = baseClient.$extends({
    name: 'wordCountCalculator',
    query: {
      scene: {
        // Intercept create operations
        async create({ args, query }) {
          if (args.data && typeof args.data.content === 'string') {
            args.data.wordCount = calculateWordCount(args.data.content)
          }
          return query(args)
        },

        // Intercept update operations
        async update({ args, query }) {
          if (args.data && typeof args.data.content === 'string') {
            args.data.wordCount = calculateWordCount(args.data.content)
          }
          return query(args)
        },

        // Intercept updateMany operations
        async updateMany({ args, query }) {
          if (args.data && typeof args.data.content === 'string') {
            args.data.wordCount = calculateWordCount(args.data.content)
          }
          return query(args)
        },

        // Intercept upsert operations
        async upsert({ args, query }) {
          if (args.create && typeof args.create.content === 'string') {
            args.create.wordCount = calculateWordCount(args.create.content)
          }
          if (args.update && typeof args.update.content === 'string') {
            args.update.wordCount = calculateWordCount(args.update.content)
          }
          return query(args)
        }
      }
    }
  })

  return client
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
