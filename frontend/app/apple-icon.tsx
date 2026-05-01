import { renderBrandIcon } from "@/lib/metadata-images";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return renderBrandIcon({
    size: size.width,
    fontSize: 92,
    borderRadius: 40,
  });
}
