"use client";

import { useState } from "react";
import { CollectionName } from "@/lib/types";
import { dataLayer } from "@/lib/data-layer";

export const useCollectionManager = <T extends { id: string }>(name: CollectionName) => {
  const [items, setItems] = useState<T[]>(() => dataLayer.listSync<T>(name));

  const saveItem = async (item: T) => {
    const next = await dataLayer.upsert(name, item);
    setItems(next as T[]);
  };

  const deleteItem = async (id: string) => {
    const next = await dataLayer.remove<T>(name, id);
    setItems(next as T[]);
  };

  return { items, saveItem, deleteItem };
};
