import { eq } from "drizzle-orm";
import * as motion from "motion/react-client";
import { redirect } from "next/navigation";
import React from "react";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { Role, users, VerificationStatus } from "@/db/schemas";
import renderVerificationStatus, {
  renderVerificationStatusMessage,
} from "@/lib/utils/parse/render-verification-status";

const page = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      verified: true,
      username: true,
    },
  });

  if (!user) {
    return redirect("/login");
  }

  if (user.verified && user.verified !== VerificationStatus.VERIFIED) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-sm w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              {renderVerificationStatus(user.verified)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm break-keep text-center">
              {renderVerificationStatusMessage({
                status: user.verified,
                username: user.username,
              })}
            </p>
            <Button
              className="mt-4 w-full rounded-lg"
              onClick={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              뒤로가기
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (user.verified === VerificationStatus.VERIFIED) {
    if (session.user.role === Role.USER) {
      return redirect("/user");
    }
    if (session.user.role === Role.ADMIN) {
      return redirect("/admin");
    }
  }
};

export default page;
