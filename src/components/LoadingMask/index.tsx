type LoadingMaskProps = {
  full?: boolean;
  type?: ''
}

export default function LoadingMask({ full }: LoadingMaskProps){


  return <div className={`loading-mask ${ full ? 'full-screen' : 'full-box'}`} >

  </div>
}
