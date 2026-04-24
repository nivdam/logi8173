import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  List,
} from "@chakra-ui/react"
import {
  FolderOpen,
  Table2,
  Users,
  Building2,
  ClipboardList,
  PenLine,
  Loader2,
} from "lucide-react"
import { useInitializeSystem } from "../api"
import { t } from "../lib/i18n"
import { animations } from "../theme/animations"
import { SetupListItem } from "./SetupListItem"
import { SetupSuccess } from "./SetupSuccess"
import logo from "../assets/logo-with-text.png"

export const SetupPage = ({ onComplete }: Props) => {
  const initializeMutation = useInitializeSystem()

  const hasCompletedSetup = !!initializeMutation.data
  const folderUrl = initializeMutation.data?.folderUrl ?? ""

  const handleInitialize = () => {
    initializeMutation.mutate(undefined)
  }

  if (hasCompletedSetup) {
    return <SetupSuccess folderUrl={folderUrl} onContinue={onComplete} />
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100dvh"
      bg="bg"
      p={{ base: "6", md: "8" }}
    >
      <Box
        bg="bg.card"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border"
        p={{ base: "6", md: "10" }}
        maxW="520px"
        w="100%"
        css={animations.fadeInUp}
      >
        <VStack gap="6" align="center">
          <Image src={logo} alt={t("app.battalion")} w="100px" h="auto" />

          <VStack gap="2">
            <Heading size="xl" fontWeight="700" textAlign="center">
              {t("setup.subtitle")}
            </Heading>
            <Text color="fg.muted" textAlign="center" textStyle="sm">
              {t("setup.description")}
            </Text>
          </VStack>

          <Box w="100%" bg="bg.muted" borderRadius="xl" p="5">
            <Text fontWeight="600" mb="3" textStyle="sm">
              {t("setup.whatCreated")}
            </Text>
            <List.Root gap="2.5" variant="plain">
              <SetupListItem icon={FolderOpen} text={t("setup.driveFolder")} index={0} />
              <SetupListItem icon={Table2} text={t("setup.masterInventory")} index={1} />
              <SetupListItem icon={Users} text={t("setup.operatorsSheet")} index={2} />
              <SetupListItem icon={Users} text={t("setup.soldiersSheet")} index={3} />
              <SetupListItem icon={Building2} text={t("setup.companiesSheet")} index={4} />
              <SetupListItem icon={ClipboardList} text={t("setup.activitiesRegistry")} index={5} />
              <SetupListItem icon={PenLine} text={t("setup.signaturesFolder")} index={6} />
            </List.Root>
          </Box>

          {initializeMutation.error && (
            <Box
              w="100%"
              bg="red.50"
              borderRadius="lg"
              p="4"
              borderWidth="1px"
              borderColor="red.200"
            >
              <Text color="red.600" textStyle="sm" fontWeight="500">
                {t("setup.errorTitle")}
              </Text>
              <Text color="red.500" textStyle="xs" mt="1">
                {initializeMutation.error.message}
              </Text>
            </Box>
          )}

          <Button
            w="100%"
            size="lg"
            bg="interactive"
            color="white"
            borderRadius="xl"
            _hover={{ bg: "interactive.hover" }}
            onClick={handleInitialize}
            disabled={initializeMutation.isPending}
          >
            {initializeMutation.isPending && <Loader2 size={18} className="animate-spin" />}
            {initializeMutation.isPending ? t("setup.initializing") : t("setup.initializeButton")}
          </Button>
        </VStack>
      </Box>
    </Flex>
  )
}

type Props = {
  onComplete: () => void
}
