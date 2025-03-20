import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentProgressLoading() {
  return (
    <div className="container p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-28" />
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <Skeleton className="h-10 w-[400px]" />
        <Skeleton className="h-10 w-[160px]" />
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b py-5">
          <div className="grid flex-1 gap-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <th key={index} className="h-12 px-4 text-left align-middle">
                          <Skeleton className="h-4 w-24" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        <td className="p-4 align-middle">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        {Array.from({ length: 5 }).map((_, colIndex) => (
                          <td key={colIndex} className="p-4 align-middle">
                            <Skeleton className="h-4 w-12" />
                          </td>
                        ))}
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
