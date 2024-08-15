import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})
export default function Home() {
  return (
    <main className={roboto.className}>
      <div className="hello">Hello world!</div>
    </main>
  );
}
