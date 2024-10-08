"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { meals } from "@/data/mealData";
import { Pencil, Check, Download } from "lucide-react";
import html2canvas from "html2canvas";
import clsx from "clsx";
import { setCookie, getCookie } from "@/lib/cookies";

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const COOKIE_NAME = "mealPlan";

export default function MealPlanner() {
  const [mealPlan, setMealPlan] = useState<string[][]>();
  const [isEditing, setIsEditing] = useState(false);
  const [availableMeals, setAvailableMeals] = useState<string[]>(meals);
  const tableRef = useRef<HTMLTableElement>(null);

  const getRandomMeal = (meals: string[]): string => {
    const randomIndex = Math.floor(Math.random() * meals.length);
    return meals[randomIndex];
  };

  useEffect(() => {
    const savedMealPlan = getCookie(COOKIE_NAME);
    if (savedMealPlan) {
      const parsedMealPlan = JSON.parse(savedMealPlan);
      setMealPlan(parsedMealPlan);
      updateAvailableMeals(parsedMealPlan);
    } else {
      setMealPlan([]);
    }
  }, []);

  const updateAvailableMeals = (currentMealPlan: string[][]) => {
    const usedMeals = new Set(currentMealPlan.flat());
    const newAvailableMeals = meals.filter((meal) => !usedMeals.has(meal));
    setAvailableMeals(newAvailableMeals);
  };

  const generateMealPlan = () => {
    const newMealPlan: string[][] = [];
    let currentAvailableMeals = [...meals];

    WEEK_DAYS.forEach(() => {
      if (currentAvailableMeals.length < 2) {
        currentAvailableMeals = [...meals];
      }
      const lunch = getRandomMeal(currentAvailableMeals);
      currentAvailableMeals = currentAvailableMeals.filter(
        (meal) => meal !== lunch
      );

      const dinner = getRandomMeal(currentAvailableMeals);
      currentAvailableMeals = currentAvailableMeals.filter(
        (meal) => meal !== dinner
      );

      newMealPlan.push([lunch, dinner]);
    });

    setMealPlan(newMealPlan);
    updateAvailableMeals(newMealPlan);
    setCookie({ name: COOKIE_NAME, value: JSON.stringify(newMealPlan) });
  };

  const replaceMeal = (dayIndex: number, mealIndex: number) => {
    if (!mealPlan) return;

    const newMealPlan = [...mealPlan];
    const oldMeal = newMealPlan[dayIndex][mealIndex];

    if (availableMeals.length === 0) {
      setAvailableMeals(meals.filter((meal) => meal !== oldMeal));
    }

    const newMeal = getRandomMeal(availableMeals);
    newMealPlan[dayIndex][mealIndex] = newMeal;

    setMealPlan(newMealPlan);
    updateAvailableMeals(newMealPlan);
    setCookie({ name: COOKIE_NAME, value: JSON.stringify(newMealPlan) });
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const downloadImage = async () => {
    if (tableRef.current) {
      const canvas = await html2canvas(tableRef.current);
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = "meal-plan.png";
      link.href = image;
      link.click();
    }
  };

  if (!mealPlan) return null;

  return (
    <div className="relative flex-grow flex flex-col">
      {mealPlan.length === 0 ? (
        <div className="flex items-center justify-center flex-grow">
          <Button onClick={generateMealPlan} size="lg">
            Generar Plan de Comidas
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 justify-between mb-4">
            <Button onClick={generateMealPlan}>Generar Nuevo Plan</Button>
            {isEditing ? (
              <Button onClick={toggleEditing} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            ) : (
              <Button onClick={toggleEditing} variant="outline" size="icon">
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Table className="mt-4" ref={tableRef}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] md:w-[250px]">Día</TableHead>
                <TableHead className="w-[calc(50%-50px)] md:w-[calc(50%-125px)]">
                  Comida
                </TableHead>
                <TableHead className="w-[calc(50%-50px)] md:w-[calc(50%-125px)]">
                  Cena
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WEEK_DAYS.map((day, dayIndex) => (
                <TableRow key={day}>
                  <TableCell className="w-[100px] md:w-[250px] align-top">
                    {day}
                  </TableCell>
                  {[0, 1].map((mealIndex) => (
                    <TableCell
                      key={mealIndex}
                      className="w-[calc(50%-50px)] md:w-[calc(50%-125px)] align-top flex-shrink-0"
                    >
                      <div className="flex items-start justify-between min-h-6">
                        <span className="flex-grow">
                          {mealPlan[dayIndex][mealIndex]}
                        </span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => replaceMeal(dayIndex, mealIndex)}
                            className="p-1 h-auto ml-2 flex-shrink-0"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            onClick={downloadImage}
            variant="default"
            className={clsx(
              "fixed bottom-4 right-4 z-10 rounded-full p-3",
              "md:relative md:inset-auto md:ml-auto md:mt-6 md:mr-2"
            )}
            size="icon"
          >
            <Download />
            <span className="sr-only">Descargar Imagen</span>
          </Button>
        </>
      )}
    </div>
  );
}
