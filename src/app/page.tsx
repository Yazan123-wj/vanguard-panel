import { redirect } from 'next/navigation';

/** The panel app has no public surface — everything lives under /admin. */
export default function Home() {
  redirect('/admin');
}
