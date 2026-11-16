import { TransitClubArchivePage } from "@/components/archive-public";

export default function ArchiveRoutePage({
  searchParams,
}: PageProps<"/transit-club/archive">) {
  return <TransitClubArchivePage searchParams={searchParams} />;
}
