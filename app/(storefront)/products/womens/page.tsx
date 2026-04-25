import { redirect } from 'next/navigation';

export default function WomensPage() {
  redirect('/products?gender=womens');
}
