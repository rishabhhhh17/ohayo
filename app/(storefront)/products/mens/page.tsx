import { redirect } from 'next/navigation';

export default function MensPage() {
  redirect('/products?gender=mens');
}
