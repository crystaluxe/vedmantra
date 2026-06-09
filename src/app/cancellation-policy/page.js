export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-8">
          Cancellation Policy
        </h1>

        <div className="space-y-6 text-white/70 leading-8">
          <p>
            Customers may request cancellation before a consultation or report
            generation has commenced.
          </p>

          <h2 className="text-xl text-white">
            Eligible Cancellation
          </h2>

          <p>
            Orders that have not yet been processed may be cancelled upon
            request.
          </p>

          <h2 className="text-xl text-white">
            Non-Cancellable Services
          </h2>

          <p>
            Once a consultation has started or a report has been generated,
            cancellation requests cannot be accepted.
          </p>

          <h2 className="text-xl text-white">
            Contact
          </h2>

          <p>
            For cancellation requests, please contact our support team before
            service fulfillment begins.
          </p>
        </div>
      </div>
    </div>
  );
}