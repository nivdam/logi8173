import { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import ReactSignatureCanvas from "react-signature-canvas";
import { Eraser } from "lucide-react";
import { t } from "../lib/i18n";

const CANVAS_HEIGHT = 160;

const pointGroupsToSvg = (
  pointGroups: Array<Array<{ x: number; y: number }>>,
  width: number,
  height: number,
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${paths.join(" ")}" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};

export const SignatureCanvas = ({ onSign, signatureData }: Props) => {
  const canvasRef = useRef<ReactSignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

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
    const svgString = pointGroupsToSvg(pointGroups, canvasWidth, CANVAS_HEIGHT);
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
            size="xs"
            color="fg.muted"
            onClick={handleClear}
          >
            <Eraser size={14} />
            {t("issuance.clearSignature")}
          </Button>
        )}
      </Flex>
      <Box
        ref={containerRef}
        borderWidth="2px"
        borderColor={signatureData ? "sage.300" : "border"}
        borderStyle="dashed"
        borderRadius="xl"
        overflow="hidden"
        bg="white"
        role="img"
        aria-label={t("issuance.signHere")}
        css={{ transition: "border-color 0.2s ease", touchAction: "none" }}
        height={`${CANVAS_HEIGHT}px`}
      >
        <ReactSignatureCanvas
          ref={canvasRef}
          penColor="#1a1a1a"
          backgroundColor="#ffffff"
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
