import { notFoundOrRedirect } from '@/lib/redirects'

type Props = { params: Promise<{ rest: string[] }> }

export default async function Page({ params }: Props) {
  const { rest } = await params
  return notFoundOrRedirect(`/${rest.join('/')}`)
}
