<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\InvoiceTemplate;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller {
    public function download(Request $request, $orderId) {
        // Admin can download any invoice; customer only their own delivered orders
        if ($request->user()->account_type === 'admin') {
            $order = Order::with(['user','items.variant.product'])->findOrFail($orderId);
        } else {
            $order = Order::with(['user','items.variant.product'])->where('user_id',$request->user()->id)->where('status','delivered')->findOrFail($orderId);
        }
        $template = InvoiceTemplate::first();
        $data = $this->buildInvoiceData($order, $template);
        $pdf = Pdf::loadView('invoices.template', $data)->setPaper('a4','portrait')->setOptions(['isHtml5ParserEnabled'=>true,'isRemoteEnabled'=>true,'dpi'=>150]);
        return $pdf->download("Invoice-{$order->order_number}.pdf");
    }
    public function preview(Request $request, $orderId) {
        $order = Order::with(['user','items.variant.product'])->findOrFail($orderId);
        $template = InvoiceTemplate::first();
        return response()->json($this->buildInvoiceData($order, $template));
    }
    public function getTemplate() {
        $template = InvoiceTemplate::first();
        if (!$template) $template = $this->createDefaultTemplate();
        return response()->json($template);
    }
    public function updateTemplate(Request $request) {
        $request->validate(['business_name'=>'required|string','business_address'=>'required|string','business_phone'=>'required|string','business_email'=>'required|string','business_website'=>'nullable|string','business_logo'=>'nullable|string','footer_note'=>'nullable|string','bank_details'=>'nullable|string','primary_color'=>'nullable|string']);
        $template = InvoiceTemplate::first() ?? new InvoiceTemplate();
        $template->fill($request->only(['business_name','business_address','business_phone','business_email','business_website','business_logo','footer_note','bank_details','primary_color'])); $template->save();
        return response()->json(['message'=>'Template updated','template'=>$template]);
    }
    private function buildInvoiceData(Order $order, $template): array {
        $subtotal=0; $items=[];
        foreach($order->items as $item){
            $product=$item->variant->product??null; $lineTotal=floatval($item->line_total_tzs); $subtotal+=$lineTotal;
            $items[]=['name'=>$product?->name??'Product','brand'=>$product?->brand??'','sku'=>$item->variant->sku??'','variant'=>implode(' · ',array_filter([$item->variant->model,$item->variant->size,$item->variant->colour])),'quantity'=>$item->quantity,'unit_price'=>floatval($item->unit_price_tzs),'discount_pct'=>floatval($item->bulk_discount_pct),'line_total'=>$lineTotal];
        }
        return ['order'=>['number'=>$order->order_number,'date'=>$order->created_at->format('d M Y'),'status'=>ucfirst($order->status),'payment_method'=>ucfirst(str_replace('_',' ',$order->payment_method)),'payment_status'=>ucfirst($order->payment_status),'delivery_type'=>$order->delivery_type==='click_and_collect'?'Click & Collect':'Home Delivery','delivery_address'=>$order->delivery_address],'customer'=>['name'=>trim(($order->user->first_name??'').' '.($order->user->last_name??'')),'email'=>$order->user->email??'','phone'=>$order->user->phone??$order->delivery_address['phone']??'','address'=>$order->delivery_address['address']??'','city'=>$order->delivery_address['city']??''],'items'=>$items,'totals'=>['subtotal'=>$subtotal,'vat'=>floatval($order->vat_amount_tzs),'discount'=>floatval($order->discount_tzs),'total'=>floatval($order->total_tzs),'currency'=>'TZS','vat_rate'=>'18%'],'business'=>['name'=>$template?->business_name??'Ekta Digital','address'=>$template?->business_address??'Haidary Plaza, India Street, Dar-es-Salaam','phone'=>$template?->business_phone??'+255 783 394 445','email'=>$template?->business_email??'EktaDigital@outlook.com','website'=>$template?->business_website??'www.ektadigital.co.tz','logo'=>$template?->business_logo??null,'footer'=>$template?->footer_note??'Thank you for shopping with Ekta Digital.','bank'=>$template?->bank_details??'','color'=>$template?->primary_color??'#008080']];
    }
    private function createDefaultTemplate(): InvoiceTemplate {
        return InvoiceTemplate::create(['business_name'=>'Ekta Digital','business_address'=>'Haidary Plaza, India Street, Dar-es-Salaam, Tanzania','business_phone'=>'+255 783 394 445 / +255 747 717 000','business_email'=>'EktaDigital@outlook.com','business_website'=>'www.ektadigital.co.tz','footer_note'=>'Thank you for shopping with Ekta Digital. Digitalise Your Lifestyle.','bank_details'=>'Bank: CRDB Bank | Account Name: Ekta Digital Ltd | Account No: [Your Account]','primary_color'=>'#008080']);
    }
}
