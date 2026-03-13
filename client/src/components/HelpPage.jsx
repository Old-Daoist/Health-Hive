import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { HelpCircle, Mail, MessageSquare, FileText, Shield } from 'lucide-react';
import { Button } from './ui/button';

export function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-gray-900">Help & Support</h2>
        <p className="text-gray-600">
          Find answers to common questions and learn how to use MediConnect Forum
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <MessageSquare className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle className="text-lg">Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Learn how to participate in forum discussions, post questions, and interact with the community.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <CardTitle className="text-lg">Medical Data</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Understand how to submit and manage your medical information securely on the platform.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="w-8 h-8 text-purple-600 mb-2" />
            <CardTitle className="text-lg">Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Learn about our privacy practices and how we protect your personal health information.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about MediConnect Forum</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is MediConnect Forum?</AccordionTrigger>
              <AccordionContent>
                MediConnect Forum is a discussion platform designed for doctors and regular users to connect, share medical knowledge, and discuss health-related topics. It provides a space for asking questions, sharing experiences, and accessing medical information from verified healthcare professionals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How do I create a discussion?</AccordionTrigger>
              <AccordionContent>
                To create a new discussion, navigate to the Discussions tab and click the "New Discussion" button. Fill in the title, select a category, and write your content. Make sure to provide enough detail so others can understand and respond to your question or topic.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>What's the difference between User and Doctor accounts?</AccordionTrigger>
              <AccordionContent>
                Doctor accounts are for verified medical professionals who can provide expert advice and access additional features. Regular user accounts are for individuals seeking medical information and community support. Doctors are identified with a special badge and stethoscope icon throughout the platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Is my medical data secure?</AccordionTrigger>
              <AccordionContent>
                Yes, we take data security seriously. All medical information is stored securely and only accessible to you. We use industry-standard encryption and security measures. However, please note that this is a demonstration platform and should not be used for real sensitive medical data.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How do I bookmark a discussion?</AccordionTrigger>
              <AccordionContent>
                When viewing a discussion, click the bookmark icon to save it for later. You can access all your bookmarked discussions from the Bookmarks section in the main navigation. This helps you quickly find important discussions you want to reference later.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Can I send private messages to other users?</AccordionTrigger>
              <AccordionContent>
                Yes, you can send private messages to other users through the Messages section. This allows for one-on-one conversations with community members. Make sure your privacy settings allow messages from other users.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>How do I edit my profile or change settings?</AccordionTrigger>
              <AccordionContent>
                Go to the Settings tab to update your profile information, change your password, manage notification preferences, and adjust privacy settings. You can customize how you interact with the platform and what information is visible to other users.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>What should I do if I see inappropriate content?</AccordionTrigger>
              <AccordionContent>
                If you encounter inappropriate content or behavior, please report it immediately through the contact support button. Our team reviews all reports and takes appropriate action to maintain a safe and respectful community.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger>Can I search for specific topics or discussions?</AccordionTrigger>
              <AccordionContent>
                Yes, use the search bar in the Discussions section to find specific topics, keywords, or discussions. You can also filter discussions by category to narrow down your search and find relevant content more easily.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger>Is medical advice on this platform a substitute for professional consultation?</AccordionTrigger>
              <AccordionContent>
                No, information shared on MediConnect Forum is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns. This platform facilitates discussion and information sharing but does not provide official medical consultations.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>Contact our support team for additional assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            If you couldn't find the answer to your question, our support team is here to help.
          </p>
          <div className="flex gap-4">
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button variant="outline">
              <HelpCircle className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
