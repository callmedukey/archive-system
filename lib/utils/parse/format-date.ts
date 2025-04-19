import { format } from "date-fns";
import { ko } from "date-fns/locale";

const formatDate = (date: Date) => {
  return format(date, "yyyy년 MM월 dd일 HH:mm", { locale: ko });
};

export default formatDate;
