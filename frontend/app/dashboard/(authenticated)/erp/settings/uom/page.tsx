"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function UoMPage() {
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [categoryFormData, setCategoryFormData] = useState({
    uom_category: "",
    uom_id: "",
    uom_name: "",
    uom_description: "",
    is_active: true,
  });

  const [unitFormData, setUnitFormData] = useState({
    category_id: "",
    name: "",
    symbol: "",
    factor: "1.0",
    is_base: false,
    is_active: true,
  });

  useEffect(() => {
    if (token && user?.is_superuser) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const [catData, unitData] = await Promise.all([
        settingsService.uomCategories.getAll(token),
        settingsService.uom.getAll(token),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setUnits(Array.isArray(unitData) ? unitData : []);
    } catch (error) {
      console.error("Error loading UoM data:", error);
      toast.error("Failed to load UoM data");
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      if (editingCategory) {
        await settingsService.uomCategories.update(editingCategory.id, categoryFormData, token);
        toast.success("Category updated successfully");
      } else {
        await settingsService.uomCategories.create(categoryFormData, token);
        toast.success("Category created successfully");
      }
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save category");
      console.error(error);
    }
  };

  const handleEditCategory = (item: any) => {
    setEditingCategory(item);
    setCategoryFormData({
      uom_category: item.uom_category || "",
      uom_id: item.uom_id || "",
      uom_name: item.uom_name || "",
      uom_description: item.uom_description || "",
      is_active: item.is_active !== false,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Are you sure you want to delete this category? All related units will also be affected.")) {
      try {
        if (!token) {
          toast.error("Not authenticated");
          return;
        }
        await settingsService.uomCategories.delete(id, token);
        toast.success("Category deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete category");
        console.error(error);
      }
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryFormData({
      uom_category: "",
      uom_id: "",
      uom_name: "",
      uom_description: "",
      is_active: true,
    });
  };

  // Unit handlers
  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const data = {
        ...unitFormData,
        category_id: parseInt(unitFormData.category_id),
        factor: parseFloat(unitFormData.factor),
      };

      if (editingUnit) {
        await settingsService.uom.update(editingUnit.id, data, token);
        toast.success("Unit updated successfully");
      } else {
        await settingsService.uom.create(data, token);
        toast.success("Unit created successfully");
      }
      setIsUnitDialogOpen(false);
      resetUnitForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save unit");
      console.error(error);
    }
  };

  const handleEditUnit = (item: any) => {
    setEditingUnit(item);
    setUnitFormData({
      category_id: item.category_id?.toString() || "",
      name: item.name || "",
      symbol: item.symbol || "",
      factor: item.factor?.toString() || "1.0",
      is_base: item.is_base || false,
      is_active: item.is_active !== false,
    });
    setIsUnitDialogOpen(true);
  };

  const handleDeleteUnit = async (id: number) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      try {
        if (!token) {
          toast.error("Not authenticated");
          return;
        }
        await settingsService.uom.delete(id, token);
        toast.success("Unit deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete unit");
        console.error(error);
      }
    }
  };

  const resetUnitForm = () => {
    setEditingUnit(null);
    setUnitFormData({
      category_id: "",
      name: "",
      symbol: "",
      factor: "1.0",
      is_base: false,
      is_active: true,
    });
  };

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.uom_category || "Unknown";
  };

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Units of Measure</h1>
        <p className="text-muted-foreground">
          Manage measurement categories and units
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={(open) => {
                setIsCategoryDialogOpen(open);
                if (!open) resetCategoryForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Update UoM category information"
                      : "Create a new UoM category"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="uom_category">Category Name *</Label>
                        <Input
                          id="uom_category"
                          value={categoryFormData.uom_category}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, uom_category: e.target.value })
                          }
                          placeholder="Length"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uom_id">Category ID *</Label>
                        <Input
                          id="uom_id"
                          value={categoryFormData.uom_id}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, uom_id: e.target.value })
                          }
                          placeholder="LEN"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uom_name">Display Name</Label>
                      <Input
                        id="uom_name"
                        value={categoryFormData.uom_name}
                        onChange={(e) =>
                          setCategoryFormData({ ...categoryFormData, uom_name: e.target.value })
                        }
                        placeholder="Length Measurement"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uom_description">Description</Label>
                      <Input
                        id="uom_description"
                        value={categoryFormData.uom_description}
                        onChange={(e) =>
                          setCategoryFormData({ ...categoryFormData, uom_description: e.target.value })
                        }
                        placeholder="Units for measuring length"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat_is_active"
                        checked={categoryFormData.is_active}
                        onCheckedChange={(checked) =>
                          setCategoryFormData({ ...categoryFormData, is_active: !!checked })
                        }
                      />
                      <Label htmlFor="cat_is_active" className="cursor-pointer">
                        Active
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingCategory ? "Update" : "Create"} Category
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category ID</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {loading ? "Loading..." : "No categories found. Add your first category."}
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.uom_id}</TableCell>
                      <TableCell>{item.uom_category}</TableCell>
                      <TableCell>{item.uom_name || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.uom_description || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCategory(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isUnitDialogOpen}
              onOpenChange={(open) => {
                setIsUnitDialogOpen(open);
                if (!open) resetUnitForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingUnit ? "Edit Unit" : "Add New Unit"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUnit
                      ? "Update unit information"
                      : "Create a new unit of measure"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUnitSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category *</Label>
                      <Select
                        value={unitFormData.category_id}
                        onValueChange={(value) =>
                          setUnitFormData({ ...unitFormData, category_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.uom_category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit_name">Unit Name *</Label>
                        <Input
                          id="unit_name"
                          value={unitFormData.name}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, name: e.target.value })
                          }
                          placeholder="Meter"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit_symbol">Symbol *</Label>
                        <Input
                          id="unit_symbol"
                          value={unitFormData.symbol}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, symbol: e.target.value })
                          }
                          placeholder="m"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit_factor">Conversion Factor *</Label>
                      <Input
                        id="unit_factor"
                        type="number"
                        step="0.000001"
                        value={unitFormData.factor}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, factor: e.target.value })
                        }
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Relative to the base unit (base unit = 1.0)
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_base"
                          checked={unitFormData.is_base}
                          onCheckedChange={(checked) =>
                            setUnitFormData({ ...unitFormData, is_base: !!checked })
                          }
                        />
                        <Label htmlFor="is_base" className="cursor-pointer">
                          Base Unit
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="unit_is_active"
                          checked={unitFormData.is_active}
                          onCheckedChange={(checked) =>
                            setUnitFormData({ ...unitFormData, is_active: !!checked })
                          }
                        />
                        <Label htmlFor="unit_is_active" className="cursor-pointer">
                          Active
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingUnit ? "Update" : "Create"} Unit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Factor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {loading ? "Loading..." : "No units found. Add your first unit."}
                    </TableCell>
                  </TableRow>
                ) : (
                  units.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{getCategoryName(item.category_id)}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.symbol}</TableCell>
                      <TableCell>{parseFloat(item.factor).toFixed(6)}</TableCell>
                      <TableCell>
                        {item.is_base && <Badge variant="secondary">Base</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUnit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUnit(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
