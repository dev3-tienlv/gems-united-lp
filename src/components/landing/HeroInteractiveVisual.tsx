import { Interactive3DVisual } from "@/components/effects/Interactive3DVisual";

export function HeroInteractiveVisual() {
  return (
    <Interactive3DVisual
      src="/logo-3d.png"
      alt="GEMS United 3D logo"
      width={460}
      height={460}
      sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 768px) 380px, 460px"
      containerClassName="h-[min(380px,calc(100vw-48px))] w-[min(380px,calc(100vw-48px))] md:h-[460px] md:w-[460px]"
      imageClassName="drop-shadow-[0_22px_24px_rgba(27,19,50,0.22)]"
      showCornerAccents
      showTopRightAccent
      priority
    />
  );
}
