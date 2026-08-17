import {ComponentType, LazyExoticComponent, Suspense} from "react";

export type LazyElementProps = {
  ele: LazyExoticComponent<ComponentType>,
  loading?: ComponentType,
  children?: ComponentType,
}

export default function LazyElement({ ele, loading: LoadingElement, children }: LazyElementProps){
  const CustomElement = ele;
  if(!LoadingElement && children) LoadingElement = children;
  return <Suspense fallback={LoadingElement && <LoadingElement />} >
    <CustomElement />
  </Suspense>
}
