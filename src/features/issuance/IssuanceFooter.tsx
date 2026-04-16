import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";
import { t } from "../../lib/i18n";
import { SignatureCanvas } from "../../components/SignatureCanvas";

export const IssuanceFooter = ({
  globalNotes,
  receiverSignature,
  giverSignature,
  savedSignatureUrl,
  isFormValid,
  totalItemCount,
  isSubmitting,
  onSetGlobalNotes,
  onSetReceiverSignature,
  onSetGiverSignature,
  onSubmit,
}: IssuanceFooterProps) => {
  const [showGiverCanvas, setShowGiverCanvas] = useState(false);

  const hasSavedSignature =
    savedSignatureUrl !== undefined && savedSignatureUrl !== "";
  const showSavedGiverSignature =
    hasSavedSignature && !showGiverCanvas && giverSignature === "";

  const handleGiverResign = () => {
    setShowGiverCanvas(true);
    onSetGiverSignature("");
  };

  const handleGiverSign = (base64: string) => {
    onSetGiverSignature(base64);
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSetGlobalNotes(event.target.value);
  };

  return (
    <Box>
      {/* הערות כלליות */}
      <Box mb="5">
        <Heading size="sm" fontWeight="600" mb="2">
          {t("issuance.globalNotes")}
        </Heading>
        <Textarea
          value={globalNotes}
          onChange={handleNotesChange}
          placeholder={t("issuance.globalNotesPlaceholder")}
          size="sm"
          borderRadius="lg"
          rows={3}
          resize="vertical"
        />
      </Box>

      {/* חתימות */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="5">
        {/* חתימת מנפק */}
        <Box>
          <Heading size="sm" fontWeight="600" mb="2">
            {t("issuance.giverSignature")}
          </Heading>

          {showSavedGiverSignature ? (
            <Box>
              <Box
                borderWidth="2px"
                borderColor="sage.300"
                borderStyle="dashed"
                borderRadius="xl"
                overflow="hidden"
                bg="white"
                p="2"
              >
                <Image
                  src={savedSignatureUrl}
                  alt={t("issuance.giverSignature")}
                  maxH="120px"
                  mx="auto"
                />
              </Box>
              <Flex justify="space-between" align="center" mt="2">
                <Text textStyle="xs" color="fg.muted">
                  {t("issuance.savedSignature")}
                </Text>
                <Button
                  variant="ghost"
                  size="xs"
                  color="fg.muted"
                  onClick={handleGiverResign}
                >
                  <RefreshCw size={12} />
                  {t("issuance.resignButton")}
                </Button>
              </Flex>
            </Box>
          ) : (
            <SignatureCanvas
              onSign={handleGiverSign}
              signatureData={giverSignature}
            />
          )}
        </Box>

        {/* חתימת מקבל */}
        <Box>
          <Heading size="sm" fontWeight="600" mb="2">
            {t("issuance.receiverSignature")}
          </Heading>
          <SignatureCanvas
            onSign={onSetReceiverSignature}
            signatureData={receiverSignature}
          />
        </Box>
      </Grid>

      {/* Submit button — sticky */}
      <Box
        position="sticky"
        bottom="0"
        mt="6"
        p="4"
        bg="bg.card"
        borderTopWidth="1px"
        borderColor="border"
      >
        <Button
          w="100%"
          size="lg"
          bg="sage.600"
          color="white"
          borderRadius="xl"
          _hover={{ bg: "sage.700" }}
          onClick={onSubmit}
          loading={isSubmitting}
          loadingText={t("issuance.submitting")}
          disabled={!isFormValid || isSubmitting}
        >
          {t("issuance.submitIssuance")} ({totalItemCount}{" "}
          {t("issuance.reviewItems")})
        </Button>
      </Box>
    </Box>
  );
};

type IssuanceFooterProps = {
  globalNotes: string;
  receiverSignature: string;
  giverSignature: string;
  savedSignatureUrl: string | undefined;
  isFormValid: boolean;
  totalItemCount: number;
  isSubmitting: boolean;
  onSetGlobalNotes: (notes: string) => void;
  onSetReceiverSignature: (base64: string) => void;
  onSetGiverSignature: (base64: string) => void;
  onSubmit: () => void;
};
