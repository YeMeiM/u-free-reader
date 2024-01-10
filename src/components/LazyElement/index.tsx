import {ComponentType, LazyExoticComponent, Suspense} from "react";

export type LazyElementProps = {
  ele: LazyExoticComponent<ComponentType>,
  loading?: ComponentType,
}

export default function LazyElement({ ele, loading: LoadingElement }: LazyElementProps){
  const CustomElement = ele;

  return <Suspense fallback={LoadingElement && <LoadingElement />} >
    <CustomElement />
  </Suspense>
}
