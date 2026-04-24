import { Box, Image } from "@chakra-ui/react"
import { useMemo } from "react"
import { sanitizeSignatureSvg } from "./signature-sanitize"

// Renders a saved signature so the stroke color adapts to the current theme
// (white on dark, red on combat, near-black on light). SVG signatures are
// sanitized (see signature-sanitize.ts) and inlined; raster signatures fall
// back to <Image> and rely on the caller's sizing.
export const SignatureImage = ({ src, alt, maxW, maxH }: SignatureImageProps) => {
  const inlineSvg = useMemo(() => sanitizeSignatureSvg(src), [src])

  if (inlineSvg !== undefined) {
    return (
      <Box
        color="fg"
        maxW={maxW}
        maxH={maxH}
        css={{
          "& svg": {
            width: "100%",
            height: "100%",
            display: "block",
          },
        }}
        dangerouslySetInnerHTML={{ __html: inlineSvg }}
        role="img"
        aria-label={alt}
      />
    )
  }

  return <Image src={src} alt={alt} maxW={maxW} maxH={maxH} />
}

type SignatureImageProps = {
  src: string
  alt: string
  maxW?: string | number
  maxH?: string | number
}
