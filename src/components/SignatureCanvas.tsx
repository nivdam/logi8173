import { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import ReactSignatureCanvas from "react-signature-canvas";
import { Eraser } from "lucide-react";
import { t } from "../lib/i18n";
import { useColorMode } from "../lib/use-color-mode";
import type { ColorMode } from "../lib/color-mode";

const CANVAS_HEIGHT = 160;

// react-signature-canvas doesn't accept Chakra tokens, so we mirror the mode
// values as raw hex. Saved SVGs use currentColor (rewritten by SignatureImage),
// so the stroke value stored here is only for the live canvas preview.
const CANVAS_COLORS: Record<ColorMode, { stroke: string; bg: string }> = {
  light: { stroke: "#16171A", bg: "#ffffff" },
  dark: { stroke: "#eef1f3", bg: "#181b1f" },
  combat: { stroke: "#ff3838", bg: "#140404" },
};

const pointGroupsToSvg = (
  pointGroups: Array<Array<{ x: number; y: number }>>,
  width: number,
  height: number,
  strokeColor: string,
): string => {
  const paths = pointGroups
    .map((group) => {
      if (group.length === 0) return "";
      if (group.length === 1) {
        return `M ${group[0].x} ${group[0].y} L ${group[0].x} ${group[0].y}`;
      }
      const start = `M ${group[0].x} ${group[0].y}`;
      const lines = group
        .slice(1)
        .map((point) => `L ${point.x} ${point.y}`)
        .join(" ");
      return `${start} ${lines}`;
    })
    .filter((path) => path !== "");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${paths.join(" ")}" stroke="${strokeColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};

export const SignatureCanvas = ({ onSign, signatureData }: Props) => {
  const canvasRef = useRef<ReactSignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const { colorMode } = useColorMode();
  const { stroke: strokeColor, bg: bgColor } = CANVAS_COLORS[colorMode];

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.round(entry.contentRect.width);
      if (width > 0) setCanvasWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // `key={colorMode}` below remounts the canvas when mode changes. Keep the
  // form state in sync so we don't leave a visually-empty canvas while the
  // parent still thinks there's a saved signature — that would let an empty
  // transaction get submitted.
  useEffect(() => {
    if (signatureData !== "") {
      onSign("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear only when the canvas remounts on mode change
  }, [colorMode]);

  const handleEnd = () => {
    if (!canvasRef.current) return;

    if (canvasRef.current.isEmpty()) {
      onSign("");
      return;
    }

    // react-signature-canvas exposes point groups without a precise exported type.
    const pointGroups = canvasRef.current.toData() as Array<
      Array<{ x: number; y: number }>
    >;
    const svgString = pointGroupsToSvg(
      pointGroups,
      canvasWidth,
      CANVAS_HEIGHT,
      strokeColor,
    );
    const svgBase64 = `data:image/svg+xml;base64,${btoa(svgString)}`;
    onSign(svgBase64);
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    canvasRef.current.clear();
    onSign("");
  };

  return (
    <Box maxW={400} w="full">
      <Flex justify="space-between" align="center" mb="2">
        <Text textStyle="sm" fontWeight="500">
          {t("issuance.signHere")}
        </Text>
        {signatureData && (
          <Button
            variant="ghost"
            size="sm"
            minH="44px"
            color="fg.muted"
            onClick={handleClear}
          >
            <Eraser size={16} />
            {t("issuance.clearSignature")}
          </Button>
        )}
      </Flex>
      <Box
        ref={containerRef}
        borderWidth="2px"
        borderColor={signatureData ? "forest.300" : "border"}
        borderStyle="dashed"
        borderRadius="xl"
        overflow="hidden"
        bg="bg.card"
        role="img"
        aria-label={t("issuance.signHere")}
        css={{ transition: "border-color 0.2s ease", touchAction: "none" }}
        height={`${CANVAS_HEIGHT}px`}
      >
        <ReactSignatureCanvas
          key={colorMode}
          ref={canvasRef}
          penColor={strokeColor}
          backgroundColor={bgColor}
          canvasProps={{
            width: canvasWidth || 1,
            height: CANVAS_HEIGHT,
            style: {
              width: "100%",
              height: `${CANVAS_HEIGHT}px`,
              display: "block",
              cursor: "crosshair",
            },
          }}
          onEnd={handleEnd}
        />
      </Box>
      {!signatureData && (
        <Text textStyle="xs" color="fg.muted" mt="1">
          {t("issuance.signatureRequired")}
        </Text>
      )}
    </Box>
  );
};

type Props = {
  onSign: (base64: string) => void;
  signatureData: string;
};
