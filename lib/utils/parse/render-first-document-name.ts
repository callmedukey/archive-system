function renderFirstDocumentName({
  reportMonth,
  name,
}: {
  reportMonth: number;
  name: string;
}) {
  switch (name) {
    case "월간보고서":
      return `${reportMonth}월 ${name} V1`;
    case "활동보고서":
      return name;
    default:
      return name;
  }
}

export default renderFirstDocumentName;
