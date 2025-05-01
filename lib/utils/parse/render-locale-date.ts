function renderLocaleDate(string: "month" | "week" | "day" | "agenda") {
  switch (string) {
    case "month":
      return "월";
    case "week":
      return "주";
    case "day":
      return "일";
    case "agenda":
      return "일정";
    default:
      return "";
  }
}

export default renderLocaleDate;
