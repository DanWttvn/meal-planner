import MealPlanner from "@/components/MealPlanner";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 flex flex-col min-h-dvh max-w-[1024px]">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Pacific Blue Meal Planner
      </h1>
      <MealPlanner />
    </main>
  );
}
