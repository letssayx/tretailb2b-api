<?php 
namespace App\Http\Traits;
trait ExportCsv{
    public function file_export(string $filename,array $file_rows){
        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );
        $callback=function() use ($file_rows){
            $file = fopen("php://output", 'w');
            foreach($file_rows as $file_row){
               fputcsv($file, $file_row);
            }
            fclose($file);

        };
        $r = \Response::stream($callback,200,$headers);
        return $r;
    }
}


