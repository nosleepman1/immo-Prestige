import React from 'react';
import { Loader } from 'lucide-react';

const CostumLoader = () => {
  return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader className="animate-spin h-12 w-12 text-muted-foreground"/>
      </div>
  );
}


export default CostumLoader;
