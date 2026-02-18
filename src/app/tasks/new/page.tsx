import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewTaskForm } from "./_components/new-task-form";

export const dynamic = "force-dynamic";

export default function NewTaskPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Criar tarefa</CardTitle>
          <CardDescription>
            Defina dificuldade e valor (HQ$ em cents).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewTaskForm />
        </CardContent>
      </Card>
    </main>
  );
}
