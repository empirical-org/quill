class PagesController < ApplicationController
  include HTTParty
  include PagesHelper
  before_filter :determine_js_file, :determine_flag
  layout :determine_layout

  NUMBER_OF_SENTENCES = "NUMBER_OF_SENTENCES"
  NUMBER_OF_STUDENTS = "NUMBER_OF_STUDENTS"
  NUMBER_OF_CITIES = "NUMBER_OF_CITIES"
  NUMBER_OF_TEACHERS = "NUMBER_OF_TEACHERS"
  NUMBER_OF_SCHOOLS = "NUMBER_OF_SCHOOLS"
  NUMBER_OF_LOW_INCOME_SCHOOLS = "NUMBER_OF_LOW_INCOME_SCHOOLS"
  OPEN_POSITIONS = Configs[:careers][:open_positions]

  def home
    if signed_in?
      redirect_to(profile_path) && return
    end
    @body_class = 'home-page'
    @activity = Activity.with_classification.find_by_uid(ENVr.fetch('HOMEPAGE_ACTIVITY_UID', ''))
    self.formats = ['html']
  end

  def home_new
    if signed_in?
      redirect_to(profile_path) && return
    end
    @title = 'Quill.org | Interactive Writing and Grammar'
    @description = 'Quill provides free writing and grammar activities for middle and high school students.'
    # default numbers are current as of 03/12/19
    @number_of_sentences = $redis.get(NUMBER_OF_SENTENCES) || 252000000
    @number_of_students = $redis.get(NUMBER_OF_STUDENTS) || 2100000

    if request.env['affiliate.tag']
      name = ReferrerUser.find_by(referral_code: request.env['affiliate.tag'])&.user&.name
      flash.now[:info] = "<strong>#{name}</strong> invited you to help your students become better writers with Quill!" if name
    end
    if check_should_clear_segment_identity
      set_just_logged_out_flag
    end
    self.formats = ['html']
  end

  def develop
  end

  def ideas
    connect = HTTParty.get('https://trello.com/1/boards/5B4Jalbc/lists?fields=name,id')
    lessons = HTTParty.get('https://trello.com/1/boards/cIRvYfE7/lists?fields=name,id')
    @connect_json = add_cards(JSON.parse(connect.body))
    @lessons_json = add_cards(JSON.parse(lessons.body))
  end

  def partners
  end

  def mission
    redirect_to('/about')
  end

  def careers
    @open_positions = OPEN_POSITIONS
  end

  def beta
  end

  def play
    @activity = Activity.with_classification.find_by_uid('-K0rnIIF_iejGqS3XPJ8')
    @module_url = @activity.anonymous_module_url
    redirect_to(@module_url.to_s)
  end

  def about
  end

  def faq
    @sections = [
      {
        title: 'General Questions',
        faqs: [
          {
            question: "What is Quill?",
            answer: "<p>Quill is a lightweight learning management system integrated with a suite of online apps that teach writing, grammar, and vocabulary skills to students. Students using Quill learn English grammar and vocabulary by fixing sentences, proofreading passages, and collaboratively writing passages. Quill is part of Empirical, a 501(c)3 nonprofit organization.</p>"
          },
          {
            question: "How does Quill work?",
            answer: "<p>Quill provides 10-15 minute exercises that help students build sentence construction skills. Quill automatically grades the writing and provides feedback and hints to help students improve it. The immediate feedback enables students to quickly build their skills, and it saves teachers dozens of hours spent on grading.</p>"
          },
          {
            question: "What are Quill's tools?",
            answer: "
              <p><strong>Quill Diagnostic</strong>: Identify Learning Gaps and Assign Personalized Learning Plans</p>
              <p><strong>Quill Lessons</strong>: Shared Group Lessons</p>
              <p><strong>Quill Connect</strong>: Combine Sentences</p>
              <p><strong>Quill Grammar</strong>: Practice Mechanics</p>
              <p><strong>Quill Proofreader</strong>: Fix Errors In Passages</p>
            "
          },
          {
            question: "Who is using Quill?",
            answer: "<p>As of June 2019, over 36,000 teachers and 1,710,000 students have used Quill. These students complete approximately 30,000 activities each day. From Rhode Island to Russia, and the Bay Area to Great Britain, these students live all over the world.</p>"
          },
          {
            question: "How can I integrate Quill into my classroom?",
            answer: "
              <p><strong>Do Now</strong>: Use Quill’s activities as a quick daily warm-up at the beginning of class.</p>
              <p><strong>Whole-Class Lessons</strong>: Lead whole-class interactive and small group writing instruction.</p>
              <p><strong>Independent Practice</strong>: Use Quill after a mini lesson to reinforce your instruction.</p>
              <p><strong>Homework</strong>: Assign Quill as homework for students to complete on a smartphone or a computer.</p>
            "
          },
          {
            question: "Which grammar concepts are covered by Quill?",
            answer: "<p>Quill activities cover more than 300 grammar concepts such as Complex Sentences, Capitalization, Fragments, Compound Sentences, Adjectives, Prepositions and more. You can view a list of our most popular activity packs <a href='https://www.quill.org/activities/packs'>here</a> and you can view a list of the standards that we cover <a href='https://www.quill.org/activities/section/7'>here</a>.</p>"
          },
          {
            question: "How much does Quill cost?",
            answer: "
              <p>All of Quill's activities are free for educators and students to use with no hidden fees. There is no limit to the number of activities you can assign or the number of students you can invite. We also offer a premium service for in-depth reporting for educators, schools, and districts. You can learn more about Quill Premium <a href='https://www.quill.org/premium'>here</a>.</p>
            "
          },
          {
            question: "How many activities are on Quill?",
            answer: "<p>As of June 2019, we have created over 500 activities with 5,000 practice questions, covering Common Core topics for grades K-12. Each activity is approximately 10-15 minutes in length.</p>"
          },
          {
            question: "I am a parent. Can I use Quill for my child?",
            answer: "<p>Yes. However, we do not currently offer parent accounts. You will need to sign up for a teacher account, create a classroom, and then add your child to it as a student.</p>"
          }
        ]
      },
      {
        title: 'Implementation Questions',
        faqs: [
          {
            question: "I just signed up for Quill. Now what?",
            answer: "<p>We have a getting started guide <a href='http://community.quill.org/wp-content/uploads/2015/11/Quill-Getting-Started-Guide-for-Teachers.pdf'>here.</a></p>"
          },
          {
            question: "How much time should my students spend on Quill?",
            answer: "<p>Quill is a supplemental tool, and each activity takes 10-15 minutes. We recommend that students complete 2-3 activities a week over eight weeks in order to see an improvement in their writing.</p>"
          },
          {
            question: "How does Quill fit into the larger classroom experience?",
            answer: "<p>Quill activities are approximately 15 minutes in length. Teachers who have a 1:1 computer to student ratio tend to use Quill as a warm-up activity at the beginning of a class. Teachers who have a limited availability of laptops tend to have their students rotate through the computers while the rest of the class engages in other activities.</p>"
          },
          {
            question: "Is there a fixed progression of activities?",
            answer: "<p>While our activities are arranged by Common Core Standard, there is not a fixed progression of activities. Teachers have all of our activities available to them, and they may choose to assign any activity they're interested in teaching.</p>"
          },
        ]
      },
      {
        title: 'Pedagogical Questions',
        faqs: [
          {
            question: "How do Quill's tools work?",
            answer: "<p>Quill currently offers 5 tools. The 5 tools are designed to work together seamlessly—activities from any tool can be assigned from the same place, in the same way, and you can mix and match activities from the different tools to build your own activity packs.</p>
            <br />
            <p><strong>Quill Proofreader</strong></p>
            <p>In Quill Proofreader, students proofread a passage to find and correct the errors. Some passages focus on a specific grammar concept, but many cover a wide range of skills to mirror a real-life proofreading and editing process.</p>
             <br />
             <p>Once students have made all their edits to the passage, we'll highlight for the student which edits are correct, which are unnecessary, and which are incorrect or not found. Then, students are automatically assigned a follow-up activity from Quill Grammar that addresses one of the skills the student needs to practice based on their proofreading.</p>
             <br />
             <p><strong>Quill Grammar</strong></p>
             <p>In Quill Grammar, students practice the basics of sentence mechanics. Here is where you'll find activities to practice skills like using proper capitalization, recognizing the difference between pronouns, and much more. As students practice these skills, they are given five chances to revise each response. After each revision, students receive feedback to help them improve their sentence.</p>
             <br />
             <p><strong>Quill Connect</strong></p>
             <p>Quill Connect is our sentence combining tool, and our most popular. In Quill Connect, students develop their sentence construction skills by combining multiple short sentences into a more sophisticated single sentence. Students are given up to five opportunities to revise their work, receiving immediate targeted feedback after each revision that guides them toward a stronger response.</p>
          <br />
          <p><strong>Quill Diagnostic</strong></p>
          <p>Quill offers four diagnostics that can be used to evaluate your students' writing. The goal of the diagnostics is to provide you with enough information about your students' needs that you can assign the most appropriate activities for your students. Because diagnostic activities are evaluative, students will not receive any feedback on their responses and will only have one attempt per question. </p>
              <br />
              <p>Once students complete a diagnostic, you'll get a report that details the results and that includes a series of recommended activities for each individual student based on their diagnostic performance. Although the detailed report shows a numerical score to help you group students into tiers, it is graded for completion elsewhere on your and your students' dashboards.</p>
              <br />
              <p><strong>Quill Lessons</strong></p>
              <p>Quill Lessons is our first tool designed to provide direct, whole-class instruction rather than independent practice. Each Quill Lesson activity includes a lesson plan with step by step instructions and explanations, and a slide-style presentation that can be projected to the class. Each student connects to the lesson using their own devices and can participate in real-time, answering questions and writing responses that can be displayed to the whole class for teacher-led discussion.</p>"
          },
          {
            question: "How does Quill provide personalized instruction and opportunities for differentiation?",
            answer: "<p>Quill offers four diagnostics, each covering different sentence construction skills. Once your students complete a diagnostic, we'll create a set of recommended activities tailored for each student based on their diagnostic results. As the teacher, you can review these recommendations and assign them all or pick and choose the ones you'd like students to complete based on your own evaluation of their needs.</p>
              <br />
              <p>You can also personalize instruction for your students by building your own activity packs. Search our entire library of content and build custom packs that can be assigned to your whole class, small groups, or individual students, giving you the freedom to assign activities that are specific to your students.</p>"
          },
          {
            question: "What approach does Quill take to giving students feedback on their writing?",
            answer: "<p>After each revision, students receive feedback on their writing. In consultation with teachers and based on current research on how to provide grammar instruction for students, we have made a few very intentional style decisions that we follow as we write this feedback. Here's an overview of some of the guidelines that our student-facing feedback follows:</p>
                <br />
              <ul>
                <li>We try to avoid using technical grammar terms and jargon; whenever possible, we try to talk about grammar concepts in terms of their function rather than their technical name.</li>
                <li>We try to use language that encourages revision as a natural part of the writing process rather than focusing on whether the student's writing is right or wrong.</li>
                <li>We try to find the right balance between guiding students with clear directives and explanation and encouraging students to think critically about their writing and discover the necessary revisions themselves.</li>
              </ul>"
          },
          {
            question: "How are Quill's activities linked to Common Core Standards?",
            answer: "
              <p>Each activity is assigned a Common Core State Standard that aligns with the grammar target of the activity. Because we recognize that the Common Core State Standards do not always map to the needs of students, we recommend deciding what's right for your students based on the grammar concept of the activity rather than the grade level indicated by the activity's CCSS. For example, we have found that many of our 4th grade CCSS activities, such as those that explore relative pronouns and clauses, are actually more appropriate for middle or high school students.</p>"
            },
          {
            question: "How are Quill activities named?",
            answer: "<p>We have a lot of activities in our library! Most of these activities are named based on the specific grammar concept they cover.</p>
              <br />
              <p>You'll notice that some activities also include words like \"Starter\" or \"Intermediate\" in the name. These words indicate the general level of the activity. Because intermediate activities build on the skills practiced in starter activities, we typically recommend having students complete a starter activity for a given skill before moving on to that skill's intermediate activities.</p>
             <br />
             <p>Some activities also include a number. If an activity includes a number, that means there are other activities that cover the same grammar concept at the same level. For example, if your students complete Parallel Structure 1 but you feel they need additional practice at that level, you can assign Parallel Structure 2.</p>"
            },
          {
            question: "What does it mean if an activity is labeled as \"Advanced Combining\"?",
            answer: "<p>Many of our activities cover a specific grammar concept, but some of our activities are categorized as \"Advanced Combining\" instead. These activities are ones that allow students to combine sentences using any grammatically correct method. Students will receive feedback based on the structure they chose to use. Advanced combining activities are a great way to give your students opportunities to problem solve and be creative in their sentence construction. Because they provide little direction for students, we recommend having students complete a few activities with a clear grammar target before doing advanced combining activities, especially if they are new to sentence combining.</p>"
            },
          {
            question: "What happens if a student answers a question incorrectly?",
            answer: "<p>Our goal is to build strong writers who have made revising an essential part of their writing process. For that reason, we provide students with the opportunity to revise each response up to five times until they have written a strong, grammatically correct sentence. After each revision, students receive feedback that guides them towards a stronger response. If after five revisions the response is still not considered strong, we'll show a few sample responses and ask the student to choose the strongest one before moving on to the next question.</p>"
            },
          {
            question: "Can students retry an activity?",
            answer: "<p>Students can retry an activity as many times as they want. Once a student has completed an activity, it remains on their dashboard, available to retry at any time.</p>"
          },
          {
            question: "How do the colored scores work?",
            answer: "<p>Quill utilizes a stoplight system of green, yellow, and red scores. A green square indicates that the student scored 76-100%. A yellow square indicates the student scored 50-75%. A red square indicates that the student scored under 50%. A grey square indicates an uncompleted lesson.</p>"
          },
          {
            question: "How does Quill decide which grammar rules to teach?",
            answer: "<p>Quill follows the guidelines for grammar and style published in the Chicago Manual of Style. While other style guides are geared towards specific audiences and genres of writing, the Chicago Manual of Style is designed to support writers of all types.</p>"
          },
          {
            question: "How does Quill address learning for English Language Learners?",
            answer: "<p>Quill provides two diagnostics specifically for ELL students. The ELL Starter Diagnostic covers the basics of sentence writing in English, including how to use \"to be,\" \"to have,\" and \"to want\" in simple sentences and questions. It is most appropriate for students who are still building their English vocabulary and beginning to work on sentence structure and verb conjugation.</p>
          <br />
          <p>The ELL Diagnostic covers a wider range of skills and includes more advanced vocabulary and skills than the starter diagnostic.</p>
          <br />
          <p>Both diagnostics for ELL students include the option to see instructions in a language other than English.</p>"
          },
          {
            question: "Does Quill comply with accessibility standards, and how can Quill be used with tools for accessibility?",
            answer: "<p>We aim to meet level AA standards from the Web Content Accessibility Guidelines (WCAG) 2.1. As of now, only part of our website is compliant with the AA standards. We are actively working to make the remaining parts of our website compliant.</p>
          <br />
            <p><strong>Where we're compliant:</strong></p>
            <p>Quill Connect, Quill Diagnostic, Quill Grammar, and the student dashboard</p>
          <br />
            <p><strong>Where we're working on becoming compliant:</strong></p>
            <p>Quill Proofreader, Quill Lessons, the teacher dashboard, and public-facing pages</p>
          <br />
            <p><strong>Accessibility features:</strong></p>
            <br />
              <ul>
                <li>Each page lets you \"Skip to main content\" by pressing the tab key</li>
                <li>Each page lets you navigate with only your keyboard</li>
                <li>Each page is designed to be used with major screen readers</li>
                <li>Each page works for almost all major screen sizes and device types</li>
                <li>Each page can zoom up to 300% without any major issues</li>
                <li>Each of our interface elements meets color contrast standards</li>
              </ul>
              <br />
              <p>Quill also fully integrates with many extensions such as <a href='https://chrome.google.com/webstore/detail/read-aloud-a-text-to-spee/hdhinadidafjejdhmfkjgnolgimiaplp?hl=en'>ReadAloud</a> and <a href='https://chrome.google.com/webstore/detail/opendyslexic/cdnapgfjopgaggbmfgbiinmmbdcglnam?hl=en'>Open Dyslexic</a>. See a list of <a href='https://support.quill.org/research-and-pedagogy/differentiation/free-extensions-for-students-with-modifications-iep-ell'>other extensions work with Quill</a>.</p>"
          }
        ]
      },
      {
        title: 'Technical Questions',
        faqs: [
          {
            question: "Why aren't activities loading?",
            answer: "<p>If you’re having trouble accessing Quill’s activities, your school is likely encountering some firewall issues when trying to access activities on Quill.org.</p>
                    <br />
                  <p>Firewall issues will generally need to be dealt with by your IT Department. We've written a brief text you can send them below. If it does not resolve your issues, please let us know.</p>
                  <br />
                  <blockquote>
                    <p>Hello,</p>
                    <br />
                    <p>Quill uses various subdomains, and Firebase to store data, so please whitelist *.quill.org as well as *.firebaseio.com.As of August 2016, Google has issued a new SSL certificate for all apps hosted by Firebase, causing issues with firewalls like FortiGate. AwesomeTable discovered this issue, and we've copied their explanation and solution below:The issue appears to be linked to the number of SANs in the certificate, which is almost a thousand. We don't know if Google is going to change something here.If you are a Fortinet user, you can enable/check \"Inspect All Ports\" in Policy & Objects > Policy > SSL/SSH Inspection > [your policy]. Explanation: when \"Inspect All Ports\" is DISABLED (you're scanning specific ports), the FortiGate's proxyworker process is doing the SSL Inspection. The proxyworker isn't able to handle all of those SANs. However, if \"Inspect All Ports\" is ENABLED, SSL Inspection gets offloaded to the IPS Module, which is able to handle that number of SANs just fine.Another solution is to write firewall rules to allow traffic with no certificate inspection for cdn.firebase.com (151.101.44.249), firebase.com and quill.org.You can test Firebase access here https://www.firebase.com/test.html</p>
                    <br />
                    <p>Thank you,</p>
                    <br />
                    <p>The Quill Engineering Team</p>
                  </blockquote>
                  <br />
                  <p>Credit to AwesomeTable for discovering the source of this complication.</p>
            "
          },
          {
            question: "What are Quill's technical requirements?",
            answer: "<p>Quill is built in HTML5, so it runs on all tablets, smartphones and modern browsers. Quill runs in Firefox, Chrome, Safari, and Internet Explorer 9, 10, and 11. Quill recommends that students have access to keyboards so that they can type their responses.</p>"
          },
          {
            question: "Can Quill be used on smartphones and tablets?",
            answer: "
              <p>Yes, Quill works on iPhones, Android devices and all tablets including Kindles. Students can start and finish their independent practice on any of these devices and they can follow along with your slides in the group mode.</p>
              <br />
              <p><span>Recommendation:</span> If students are using Quill on a tablet, for better typing we recommend using a keyboard with the tablet. We have seen that students perform better and type faster with a keyboard rather than a touchscreen.</p>
              <br />
              <p><em>Coming soon:</em> We are currently working on a mobile app that will allow students to do their homework or independent practice on their phone while offline and share their score with their teachers when they are back online.</p>
            "
          },
          {
            question: "What technologies is Quill built off of?",
            answer: "<p>The Quill LMS is built in Ruby on Rails. Our newer tools, including Quill Diagnostic and Quill Connect, were written in React.js, while Quill Grammar and Quill Proofreader were written in Angular.js. We make use of additional libraries and tools as needed, including Redux, TypeScript, Redis, Firebase, and Elasticsearch.</p>"
          },
          {
            question: "How can I get started with Quill?",
            answer: "<p>Teachers create teacher accounts and students create student accounts by clicking <a href='https://www.quill.org/account/new'>here</a>. Teachers are given a class code for each class. Students join their teacher's class by plugging in their teacher's class code. Teachers may also manually create accounts for their students. If you have a Google Classroom account, you can sign up with Google and import your students. For more information about getting started, please visit our <a href='https://www.quill.org/teacher-center'>Teacher Resources</a> page. You can also download our <a href='https://d1yxac6hjodhgc.cloudfront.net/wp-content/uploads/2015/11/Quill-Getting-Started-Guide-for-Teachers.pdf'>Getting Started Guide for Teachers.</a></p>"
          },
        ]
      },
      {
        title: 'Organizational Questions',
        faqs: [
          {
            question: "Why is Quill a nonprofit organization?",
            answer: "<p>Quill's mission is to collaboratively build educational materials and make those materials freely available. We work with a large team of volunteers who spend their time on this project because they believe in this mission. We, in turn, have no interest in ever being purchased by another company or being sold on the stock market. While we are a commercial nonprofit, and intend to generate sustainable revenue, our mission is to revolutionize how students learn.</p>"
          },
          {
            question: "What are some other similar nonprofit organizations?",
            answer: "<p>In educational technology, the closest organization to our own is Reasoning Mind. Reasoning Mind is a nonprofit organization that charges a fee to use its mathematics software. Another similar nonprofit is EdX. EdX intends to create sustainable revenue by charging school systems for its services.</p>"
          },
          {
            question: "What does Open Source mean?",
            answer: "<p>Open Source means that all of our code is made freely available. You may download it and install it for free for any non-commercial purpose. Other developers may reuse our code in their programs. We build our code through GitHub, and you can see what we are working on at the moment <a href='https://github.com/empirical-org/quill/issues?state=open_'>here</a>.</p>"
          },
          {
            question: "What does Open Content mean?",
            answer: "<p>All of our instructional materials are made available under a Creative Commons BY-SA-NC license. This means that you may reuse our materials for any non-commercial purpose.</p>"
          },
          {
            question: "I have an idea or a suggestion for Quill. How can I share it?",
            answer: "
              <p>We are always looking for suggestions and ideas from our teachers to improve and grow Quill so if you have an idea that you would like to see on Quill, please fill out <a href='https://docs.google.com/forms/d/e/1FAIpQLScwoB67VKZicMzukzpiK5ufDFSEjLXbUBjEGOl_UMsRl02aiw/viewform?usp=send_form'>this short form</a> and share it with us. We have so far turned many of our teachers' ideas to products such as Quill Diagnostic and Quill Lessons, so don't hesitate to reach out to us.</p>
            "
          },
        ]
      },
      {
        title: 'Supporting Quill',
        faqs: [
          {
            question: "Can I donate to Quill?",
            answer: "<p>Yes, as a 501(c)3 charitable organization, you can make a tax deductible donation to us. Please email <a href='hello@quill.org'>hello@quill.org</a> for more information about this.</p>"
          },
          {
            question: "How can I work with Quill as an educator?",
            answer: "<p>We are always looking for educators who are interested in helping Quill by providing feedback, creating content, or giving us ideas for new apps. Please contact us at <a href='hello@quill.org'>hello@quill.org</a> if you would like to do any of these things.</p>"
          },
          {
            question: "How can I work with Quill as a developer?",
            answer: "<p>We are open source and can always use volunteer developers! Our Github is here: <a href='https://github.com/empirical-org'>https://github.com/empirical-org</a>.</p>"
          },
        ]
      }
    ]
  end

  def impact
    @number_of_students = $redis.get(NUMBER_OF_STUDENTS) || 2100000
    @number_of_schools = $redis.get(NUMBER_OF_SCHOOLS) || 14651
    @number_of_sentences = $redis.get(NUMBER_OF_SENTENCES) || 252000000
    @number_of_low_income_schools = $redis.get(NUMBER_OF_LOW_INCOME_SCHOOLS) || 8911
    @number_of_teachers = $redis.get(NUMBER_OF_TEACHERS) || 44100
  end

  def team
  end

  def tos
    @body_class = 'auxiliary white-page formatted-text'
  end

  def media_kit
  end

  def privacy
    @body_class = 'auxiliary white-page formatted-text'
  end

  def board
  end

  def diagnostic_tool
    @title = 'Quill Diagnostic | Free Diagnostic and Adaptive Lesson Plan'
    @description = 'Quickly determine which skills your students need to work on with our 22 question diagnostic.'
  end

  def grammar_tool
    @title = 'Quill Grammar | Free 10 Minute Activities for your Students'
    @description = 'Over 150 sentence writing activities to help your students practice basic grammar skills.'
  end

  def proofreader_tool
    @title = 'Quill Proofreader | Over 100 Expository Passages To Read And Edit'
    @description = 'Students edit passages and receive personalized exercises based on their results.'
  end

  def connect_tool
    @title = 'Quill Connect | Free Sentence Structure Activities'
    @description = 'Help your students advance from fragmented and run-on sentences to complex and well-structured sentences with Quill Connect.'
  end

  def lessons_tool
    @title = 'Quill Lessons | Free Group Writing Activities'
    @description = 'Lead whole-class and small group writing instruction with interactive writing prompts and discussion topics.'
  end

  def activities
    @body_class = 'full-width-page white-page'
    @section = params[:section_id].present? ? Section.find(params[:section_id]) : Section.first
    @topics = @section.topics.map{ |topic| [topic, topic.activities.production] }.select{ |group| group.second.any? }
  end

  # for link to premium within 'about' (discover) pages
  def premium
    @user_is_eligible_for_new_subscription= current_user&.eligible_for_new_subscription?
    @user_is_eligible_for_trial = current_user&.subscriptions&.where&.not(account_type: Subscription::COVID_TYPES)&.none?

    @user_has_school = !!current_user&.school && ['home school', 'us higher ed', 'international', 'other', 'not listed'].exclude?(current_user&.school&.name)
    @user_belongs_to_school_that_has_paid = current_user&.school ? Subscription.school_or_user_has_ever_paid?(current_user&.school) : false
    @last_four = current_user&.last_four

    @title = 'Premium'
  end

  def tutorials
  end

  def press
    @in_the_news = BlogPost.where(draft: false, topic: BlogPost::IN_THE_NEWS).order(published_at: :desc)
    @press_releases = BlogPost.where(draft: false, topic: BlogPost::PRESS_RELEASES).order(published_at: :desc)
  end

  def announcements
    @blog_posts = BlogPost.where(draft: false, topic: BlogPost::WHATS_NEW).order('order_number')
  end

  def referrals_toc
  end

  def preap_units
    render json: { units: preap_content }
  end

  def backpack
    @style_file = 'staff'
  end

  def comprehension
    @style_file = ApplicationController::COMPREHENSION
  end

  def proofreader
    @style_file = ApplicationController::PROOFREADER
  end

  def grammar
    @style_file = ApplicationController::GRAMMAR
  end

  def diagnostic
    @style_file = ApplicationController::DIAGNOSTIC
  end

  private

  def determine_layout
    case action_name
    when 'home'
      'home'
    when 'home_new', 'diagnostic_tool', 'connect_tool', 'grammar_tool', 'proofreader_tool', 'lessons_tool'
      'twenty_seventeen_home'
    when ApplicationController::COMPREHENSION, ApplicationController::PROOFREADER, ApplicationController::GRAMMAR, ApplicationController::DIAGNOSTIC
      'activity'
    end
  end

  def determine_js_file
    case action_name
    when 'partners', 'mission', 'faq', 'impact', 'team', 'tos', 'media_kit', 'media', 'faq', 'privacy', 'map', 'teacher-center', 'news', 'stats', 'activities'
      @js_file = 'public'
    when 'grammar_tool', 'connect_tool', 'diagnostic_tool', 'proofreader_tool', 'lessons_tool'
      @js_file = 'tools'
    when 'backpack'
      @js_file = 'staff'
    when ApplicationController::COMPREHENSION
      @js_file = ApplicationController::COMPREHENSION
    when ApplicationController::PROOFREADER
      @js_file = ApplicationController::PROOFREADER
    when ApplicationController::GRAMMAR
      @js_file = ApplicationController::GRAMMAR
    when ApplicationController::DIAGNOSTIC
      @js_file = ApplicationController::DIAGNOSTIC
    end
  end

  def determine_flag
    case action_name
    when 'grammar_tool', 'connect_tool', 'diagnostic_tool', 'proofreader_tool', 'lessons_tool'
      @beta_flag = current_user && current_user&.testing_flag == 'beta'
    end
  end

  def add_cards(list_response)
    list_response.each{|list| list["cards"] = HTTParty.get("https://api.trello.com/1/lists/#{list['id']}/cards/?fields=name,url")}
    list_response
  end

  def set_just_logged_out_flag
    session.delete(SessionsController::CLEAR_ANALYTICS_SESSION_KEY)
    @logging_user_out = true
  end

  def check_should_clear_segment_identity
    return true if session.key?(SessionsController::CLEAR_ANALYTICS_SESSION_KEY)
  end


end
