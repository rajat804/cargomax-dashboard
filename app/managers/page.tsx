// app/managers/page.tsx
import ManagerList from "./components/ManagerList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ManagersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Managers</h1>
          <p className="text-muted-foreground">Manage all warehouse managers</p>
        </div>

        <Link href="/managers/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Manager
          </Button>
        </Link>
      </div>

      <ManagerList />
    </div>
  );
}