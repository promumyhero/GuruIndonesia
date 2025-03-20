import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentsLoading() {
  return (
    <div className="container p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Mobile View */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>
                <Skeleton className="h-6 w-full" />
              </CardTitle>
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Skeleton className="h-4 w-24" />
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
