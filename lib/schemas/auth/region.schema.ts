import { z } from "zod";

export const CreateRegionSchema = z.object({
  name: z
    .string({ message: "권역 이름을 입력해주세요." })
    .min(1, { message: "권역 이름을 입력해주세요." }),
});
