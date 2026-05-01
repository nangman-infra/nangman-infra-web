import { renderSocialImage } from "@/lib/metadata-images";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Nangman Infra | We Build the Invisible";

export default function TwitterImage() {
  return renderSocialImage();
}
