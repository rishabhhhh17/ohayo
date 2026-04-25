import { redirect } from 'next/navigation';

export default function KidsPage() {
  redirect('/products?gender=kids');
}
