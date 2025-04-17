import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";

import { AdminSignUpForm } from "./components/admin-sign-up-form";
import { UserSignUpForm } from "./components/user-sign-up-form";

export default async function SignUpPage() {
  const regions = await db.query.regions.findMany();
  const regionsOptions = regions.map((region) => ({
    label: region.name,
    value: region.id,
  }));

  return (
    <div className="w-full max-w-md">
      <h1 className="text-center mb-4">회원가입</h1>
      <Tabs defaultValue="user">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">등록자</TabsTrigger>
          <TabsTrigger value="admin">관리자</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>등록자 회원가입</CardTitle>
            </CardHeader>
            <CardContent>
              <UserSignUpForm regionsOptions={regionsOptions} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>관리자 회원가입</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminSignUpForm regionsOptions={regionsOptions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
