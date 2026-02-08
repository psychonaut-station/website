import { Suspense } from 'react';

import Verify from '@/app/ui/verify';

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <Verify />
    </Suspense>
  );
}
