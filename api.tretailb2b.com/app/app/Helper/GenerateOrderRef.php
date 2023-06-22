<?
namespace App\Helper;

class GenerateOrderRef{

    public static function getRef($previous_ref,$prefix){

        $default_limit=12;
        if ( str_replace($prefix,"",$previous_ref) == $previous_ref ){
            return self::getInitialRef($prefix);
        }else{
            return $prefix.self::addLeadingZero(1 + (int)str_replace($prefix,"",$previous_ref), $default_limit);
        }
    }

    public static function getInitialRef($prefix){

        $default_limit=12;
        return $prefix.self::addLeadingZero(1, $default_limit);

    }

    static function addLeadingZero($num,$limit){
        $num = strval($num);
        $len = strlen(strval($num));
        $count = (int)$limit - (int)$len;
        $zeros="";
        for( $i = 0 ; $i < $count; $i++){
            $zeros.="0";
        }
        return $zeros.$num;

    }

}