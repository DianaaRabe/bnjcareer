import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[pre-push] Cleaning up legacy tables and cross-schema constraints...')
  
  try {
    // Drop the obsolete 'companies' table from the old Next.js app which caused P4002 cross-schema error
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS public.companies CASCADE;`)
    console.log('[pre-push] ✓ Legacy companies table dropped')
  } catch (err) {
    console.warn('[pre-push] Notice companies table:', (err as Error).message)
  }

  try {
    // Drop any remaining constraint pointing to auth.users from the old Next.js schema
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_id_fkey') THEN
          ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
        END IF;
      END $$;
    `)
    console.log('[pre-push] ✓ Legacy foreign keys to auth.users removed')
  } catch (err) {
    console.warn('[pre-push] Notice profiles constraint:', (err as Error).message)
  }
}

main()
  .catch((err) => {
    console.error('[pre-push] Unexpected error:', err)
  })
  .finally(() => prisma.$disconnect())
