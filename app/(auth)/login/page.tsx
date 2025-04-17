import * as motion from "motion/react-client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <h1 className="text-center mb-4">로그인</h1>
      <Tabs defaultValue="user">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">등록자</TabsTrigger>
          <TabsTrigger value="admin">관리자</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>등록자 로그인</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm redirectTo="/user" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>관리자 로그인</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm redirectTo="/admin" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
