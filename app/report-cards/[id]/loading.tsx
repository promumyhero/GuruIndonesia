import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportCardDetailLoading() {
  return (
    <div className="container p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-28" />
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-10 w-16" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <Skeleton className="h-4 w-32" />
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
                    {Array.from({ length: 3 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="p-4 align-middle">
                          <Skeleton className="h-6 w-12" />
                        </td>
                        <td className="p-4 align-middle">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
