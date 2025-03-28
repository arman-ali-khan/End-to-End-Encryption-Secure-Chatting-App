import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to NextChat</h1>
          <p className="text-muted-foreground">
            A secure, feature-rich chat application with end-to-end encryption
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/auth/login">
            <Button className="w-full" size="lg">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="w-full" variant="outline" size="lg">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By using NextChat, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}